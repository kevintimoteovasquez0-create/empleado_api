import { 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { RequisitoDocumentoTable } from 'src/drizzle/schema/requisito_documento';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';

@Injectable()
export class RequisitoDocumentoService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllRequisitoDocumentos(paginationDto: PaginationDto, estado: boolean) {
    try {
      const { page, limit } = paginationDto;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(RequisitoDocumentoTable)
        .where(eq(RequisitoDocumentoTable.estado_registro, estado));

      const getAllRegistros = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistros / finalLimit);

      const responseRequisitos = await this.db
        .select()
        .from(RequisitoDocumentoTable)
        .where(eq(RequisitoDocumentoTable.estado_registro, estado))
        .orderBy(RequisitoDocumentoTable.orden_visualizacion)
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit);

      return {
        data: responseRequisitos,
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

  async findRequisitoDocumentoById(id: number, estado: boolean) {
    try {
      const [response] = await this.db
        .select()
        .from(RequisitoDocumentoTable)
        .where(
          and(
            eq(RequisitoDocumentoTable.id, id),
            eq(RequisitoDocumentoTable.estado_registro, estado),
          ),
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(
          `No se encontró el requisito documento con id ${id}`,
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

  async createRequisitoDocumento(createRequisitoDocumentoDto: CreateRequisitoDocumentoDto) {
    try {
      // Validar que el orden de visualización no esté duplicado
      const [existingOrden] = await this.db
        .select()
        .from(RequisitoDocumentoTable)
        .where(
          and(
            eq(RequisitoDocumentoTable.orden_visualizacion, createRequisitoDocumentoDto.orden_visualizacion),
            eq(RequisitoDocumentoTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (existingOrden) {
        throw new BadRequestException(
          `Ya existe un requisito con el orden de visualización ${createRequisitoDocumentoDto.orden_visualizacion}`,
        );
      }

      await this.db
        .insert(RequisitoDocumentoTable)
        .values({ ...createRequisitoDocumentoDto });

      return {
        message: 'Requisito documento creado correctamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateRequisitoDocumento(id: number, updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto) {
    try {
      await this.findRequisitoDocumentoById(id, true);

      // Si se está actualizando el orden de visualización, validar que no esté duplicado
      if (updateRequisitoDocumentoDto.orden_visualizacion) {
        const [existingOrden] = await this.db
          .select()
          .from(RequisitoDocumentoTable)
          .where(
            and(
              eq(RequisitoDocumentoTable.orden_visualizacion, updateRequisitoDocumentoDto.orden_visualizacion),
              eq(RequisitoDocumentoTable.estado_registro, true),
            ),
          )
          .limit(1);

        if (existingOrden && existingOrden.id !== id) {
          throw new BadRequestException(
            `Ya existe un requisito con el orden de visualización ${updateRequisitoDocumentoDto.orden_visualizacion}`,
          );
        }
      }

      await this.db
        .update(RequisitoDocumentoTable)
        .set({ ...updateRequisitoDocumentoDto })
        .where(eq(RequisitoDocumentoTable.id, id));

      return {
        message: 'Requisito documento actualizado correctamente',
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

  async restoreRequisitoDocumento(id: number) {
    try {
      await this.findRequisitoDocumentoById(id, false);

      await this.db
        .update(RequisitoDocumentoTable)
        .set({ estado_registro: true })
        .where(eq(RequisitoDocumentoTable.id, id));

      return {
        message: 'Requisito documento restaurado correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removeRequisitoDocumento(id: number) {
    try {
      await this.findRequisitoDocumentoById(id, true);

      await this.db
        .update(RequisitoDocumentoTable)
        .set({ estado_registro: false })
        .where(eq(RequisitoDocumentoTable.id, id));

      return {
        message: 'Requisito documento removido correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}