import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, count, eq, desc } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { DocumentoEmpleadoTable } from 'src/drizzle/schema/documento_empleado';
import { RequisitoDocumentoTable } from 'src/drizzle/schema/requisito_documento';
import { EmpleadoTable } from 'src/drizzle/schema/empleado';
import { CreateDocumentoEmpleadoDto } from './dto/create-documento-empleado.dto';
import { UpdateDocumentoEmpleadoDto } from './dto/update-documento-empleado.dto';

@Injectable()
export class DocumentoEmpleadoService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllDocumentosEmpleado(
    paginationDto: PaginationDto,
    empleadoId?: number,
    estado?: string,
  ) {
    try {
      const { page, limit } = paginationDto;

      let filter;
      if (
        typeof empleadoId === 'number' &&
        estado &&
        ['PENDIENTE', 'COMPLETO', 'OBSERVADO'].includes(estado)
      ) {
        filter = and(
          eq(DocumentoEmpleadoTable.empleado_id, empleadoId),
          eq(
            DocumentoEmpleadoTable.estado,
            estado as 'PENDIENTE' | 'COMPLETO' | 'OBSERVADO',
          ),
          eq(DocumentoEmpleadoTable.estado_registro, true),
        );
      } else if (typeof empleadoId === 'number') {
        filter = and(
          eq(DocumentoEmpleadoTable.empleado_id, empleadoId),
          eq(DocumentoEmpleadoTable.estado_registro, true),
        );
      } else if (
        estado &&
        ['PENDIENTE', 'COMPLETO', 'OBSERVADO'].includes(estado)
      ) {
        filter = and(
          eq(
            DocumentoEmpleadoTable.estado,
            estado as 'PENDIENTE' | 'COMPLETO' | 'OBSERVADO',
          ),
          eq(DocumentoEmpleadoTable.estado_registro, true),
        );
      } else {
        filter = eq(DocumentoEmpleadoTable.estado_registro, true);
      }

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(DocumentoEmpleadoTable)
        .where(filter);

      const getAllRegistros = Number(total);
      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;
      const numberPages = Math.ceil(getAllRegistros / finalLimit);

      const responseDocumentos = await this.db
        .select({
          id: DocumentoEmpleadoTable.id,
          empleado_id: DocumentoEmpleadoTable.empleado_id,
          requisito_id: DocumentoEmpleadoTable.requisito_id,
          archivo_pdf: DocumentoEmpleadoTable.archivo_pdf,
          tipo_archivo: DocumentoEmpleadoTable.tipo_archivo,
          estado: DocumentoEmpleadoTable.estado,
          observacion_texto: DocumentoEmpleadoTable.observacion_texto,
          fecha_subida: DocumentoEmpleadoTable.fecha_subida,
          revisado_por: DocumentoEmpleadoTable.revisado_por,
          fecha_revision: DocumentoEmpleadoTable.fecha_revision,
          createdAt: DocumentoEmpleadoTable.createdAt,
          updatedAt: DocumentoEmpleadoTable.updatedAt,
          requisito: {
            id: RequisitoDocumentoTable.id,
            nombre: RequisitoDocumentoTable.nombre,
            descripcion: RequisitoDocumentoTable.descripcion,
            es_obligatorio: RequisitoDocumentoTable.es_obligatorio,
          },
        })
        .from(DocumentoEmpleadoTable)
        .leftJoin(
          RequisitoDocumentoTable,
          eq(DocumentoEmpleadoTable.requisito_id, RequisitoDocumentoTable.id),
        )
        .where(filter)
        .orderBy(desc(DocumentoEmpleadoTable.fecha_subida))
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit);

      return {
        data: responseDocumentos,
        pagination: {
          total: getAllRegistros,
          page: finalPage,
          limit: finalLimit,
          finalPage: numberPages,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  /**
   * Obtener un documento por ID con información del requisito
   */
  async findDocumentoEmpleadoById(id: number) {
    try {
      const [response] = await this.db
        .select({
          id: DocumentoEmpleadoTable.id,
          empleado_id: DocumentoEmpleadoTable.empleado_id,
          requisito_id: DocumentoEmpleadoTable.requisito_id,
          archivo_pdf: DocumentoEmpleadoTable.archivo_pdf,
          tipo_archivo: DocumentoEmpleadoTable.tipo_archivo,
          estado: DocumentoEmpleadoTable.estado,
          observacion_texto: DocumentoEmpleadoTable.observacion_texto,
          fecha_subida: DocumentoEmpleadoTable.fecha_subida,
          revisado_por: DocumentoEmpleadoTable.revisado_por,
          fecha_revision: DocumentoEmpleadoTable.fecha_revision,
          createdAt: DocumentoEmpleadoTable.createdAt,
          updatedAt: DocumentoEmpleadoTable.updatedAt,
          requisito: {
            id: RequisitoDocumentoTable.id,
            nombre: RequisitoDocumentoTable.nombre,
            descripcion: RequisitoDocumentoTable.descripcion,
            es_obligatorio: RequisitoDocumentoTable.es_obligatorio,
            aplica_para: RequisitoDocumentoTable.aplica_para,
          },
        })
        .from(DocumentoEmpleadoTable)
        .leftJoin(
          RequisitoDocumentoTable,
          eq(DocumentoEmpleadoTable.requisito_id, RequisitoDocumentoTable.id),
        )
        .where(
          and(
            eq(DocumentoEmpleadoTable.id, id),
            eq(DocumentoEmpleadoTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(
          `No se encontró el documento empleado con id ${id}`,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async findDocumentosByEmpleadoId(empleadoId: number) {
    try {
      const [empleado] = await this.db
        .select()
        .from(EmpleadoTable)
        .where(eq(EmpleadoTable.id, empleadoId))
        .limit(1);

      if (!empleado) {
        throw new NotFoundException(
          `No se encontró el empleado con id ${empleadoId}`,
        );
      }

      const documentos = await this.db
        .select({
          id: DocumentoEmpleadoTable.id,
          requisito_id: DocumentoEmpleadoTable.requisito_id,
          archivo_pdf: DocumentoEmpleadoTable.archivo_pdf,
          tipo_archivo: DocumentoEmpleadoTable.tipo_archivo,
          estado: DocumentoEmpleadoTable.estado,
          observacion_texto: DocumentoEmpleadoTable.observacion_texto,
          fecha_subida: DocumentoEmpleadoTable.fecha_subida,
          requisito: {
            id: RequisitoDocumentoTable.id,
            nombre: RequisitoDocumentoTable.nombre,
            es_obligatorio: RequisitoDocumentoTable.es_obligatorio,
          },
        })
        .from(DocumentoEmpleadoTable)
        .leftJoin(
          RequisitoDocumentoTable,
          eq(DocumentoEmpleadoTable.requisito_id, RequisitoDocumentoTable.id),
        )
        .where(
          and(
            eq(DocumentoEmpleadoTable.empleado_id, empleadoId),
            eq(DocumentoEmpleadoTable.estado_registro, true),
          ),
        )
        .orderBy(desc(DocumentoEmpleadoTable.fecha_subida));

      return documentos;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createDocumentoEmpleado(
    createDocumentoEmpleadoDto: CreateDocumentoEmpleadoDto,
  ) {
    try {
      // VALIDACIÓN 1: Verificar que el empleado exista
      const [empleado] = await this.db
        .select()
        .from(EmpleadoTable)
        .where(eq(EmpleadoTable.id, createDocumentoEmpleadoDto.empleado_id))
        .limit(1);

      if (!empleado) {
        throw new BadRequestException(
          `El empleado con id ${createDocumentoEmpleadoDto.empleado_id} no existe`,
        );
      }

      const [requisito] = await this.db
        .select()
        .from(RequisitoDocumentoTable)
        .where(
          and(
            eq(
              RequisitoDocumentoTable.id,
              createDocumentoEmpleadoDto.requisito_id,
            ),
            eq(RequisitoDocumentoTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (!requisito) {
        throw new BadRequestException(
          `El requisito con id ${createDocumentoEmpleadoDto.requisito_id} no existe o está inactivo`,
        );
      }

      const [existingDoc] = await this.db
        .select()
        .from(DocumentoEmpleadoTable)
        .where(
          and(
            eq(
              DocumentoEmpleadoTable.empleado_id,
              createDocumentoEmpleadoDto.empleado_id,
            ),
            eq(
              DocumentoEmpleadoTable.requisito_id,
              createDocumentoEmpleadoDto.requisito_id,
            ),
            eq(DocumentoEmpleadoTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (existingDoc) {
        throw new BadRequestException(
          `Ya existe un documento del requisito "${requisito.nombre}" para este empleado`,
        );
      }

      const fechaRevision = createDocumentoEmpleadoDto.revisado_por
        ? new Date()
        : null;

      await this.db.insert(DocumentoEmpleadoTable).values({
        ...createDocumentoEmpleadoDto,
        estado: createDocumentoEmpleadoDto.estado || 'PENDIENTE',
        fecha_revision: fechaRevision,
        estado_registro: true,
      });

      return {
        message: 'Documento empleado creado correctamente',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateDocumentoEmpleado(
    id: number,
    updateDocumentoEmpleadoDto: UpdateDocumentoEmpleadoDto,
  ) {
    try {
      await this.findDocumentoEmpleadoById(id);

      if (updateDocumentoEmpleadoDto.empleado_id) {
        const [empleado] = await this.db
          .select()
          .from(EmpleadoTable)
          .where(eq(EmpleadoTable.id, updateDocumentoEmpleadoDto.empleado_id))
          .limit(1);

        if (!empleado) {
          throw new BadRequestException(
            `El empleado con id ${updateDocumentoEmpleadoDto.empleado_id} no existe`,
          );
        }
      }

      if (updateDocumentoEmpleadoDto.requisito_id) {
        const [requisito] = await this.db
          .select()
          .from(RequisitoDocumentoTable)
          .where(
            and(
              eq(
                RequisitoDocumentoTable.id,
                updateDocumentoEmpleadoDto.requisito_id,
              ),
              eq(RequisitoDocumentoTable.estado_registro, true),
            ),
          )
          .limit(1);

        if (!requisito) {
          throw new BadRequestException(
            `El requisito con id ${updateDocumentoEmpleadoDto.requisito_id} no existe o está inactivo`,
          );
        }
      }

      const updateData: any = { ...updateDocumentoEmpleadoDto };
      if (updateDocumentoEmpleadoDto.revisado_por) {
        (updateData as any).fecha_revision = new Date();
      }

      await this.db
        .update(DocumentoEmpleadoTable)
        .set(updateData)
        .where(eq(DocumentoEmpleadoTable.id, id));

      return {
        message: 'Documento empleado actualizado correctamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async cambiarEstadoDocumento(
    id: number,
    estado: 'PENDIENTE' | 'COMPLETO' | 'OBSERVADO',
    observacion?: string,
    revisadoPor?: number,
  ) {
    try {
      await this.findDocumentoEmpleadoById(id);

      const updateData: any = {
        estado,
        fecha_revision: new Date(),
      };

      if (observacion) {
        (updateData as any).observacion_texto = observacion;
      }

      if (revisadoPor) {
        (updateData as any).revisado_por = revisadoPor;
      }

      await this.db
        .update(DocumentoEmpleadoTable)
        .set(updateData)
        .where(eq(DocumentoEmpleadoTable.id, id));

      return {
        message: `Estado del documento cambiado a ${estado} correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removeDocumentoEmpleado(id: number) {
    try {
      await this.findDocumentoEmpleadoById(id);

      await this.db
        .update(DocumentoEmpleadoTable)
        .set({ estado_registro: false })
        .where(eq(DocumentoEmpleadoTable.id, id));

      return {
        message: 'Documento empleado eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async restoreDocumentoEmpleado(id: number) {
    try {
      const [documento] = await this.db
        .select()
        .from(DocumentoEmpleadoTable)
        .where(
          and(
            eq(DocumentoEmpleadoTable.id, id),
            eq(DocumentoEmpleadoTable.estado_registro, false),
          ),
        )
        .limit(1);

      if (!documento) {
        throw new NotFoundException(
          `No se encontró el documento empleado con id ${id} o ya está activo`,
        );
      }

      await this.db
        .update(DocumentoEmpleadoTable)
        .set({ estado_registro: true })
        .where(eq(DocumentoEmpleadoTable.id, id));

      return {
        message: 'Documento empleado restaurado correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
