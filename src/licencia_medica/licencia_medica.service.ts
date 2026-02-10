import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { EmpleadoTable } from 'src/drizzle/schema/empleado';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { licencia_medica } from 'src/drizzle/schema/licencia_medica';
import { CreateLicenciaMedicaDto } from './dto/create-licencia_medica.dto';
import { UpdateLicenciaMedicaDto } from './dto/update-licencia_medica.dto';

@Injectable()
export class LicenciaMedicaService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllLicenciasMedicas(paginationDto: PaginationDto, estado: boolean) {
    try {
      const { page, limit } = paginationDto;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(licencia_medica)
        .where(eq(licencia_medica.estado_registro, estado));

      const getAllRegistrosLicencias = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistrosLicencias / finalLimit);

      const { empleado_id, revisado_por, ...restoCamposLicencia } =
        getTableColumns(licencia_medica);

      const responseLicencias = await this.db
        .select({
          ...restoCamposLicencia,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
          revisor: {
            id: UsuarioTable.id,
            nombre: UsuarioTable.nombre,
            apellido: UsuarioTable.apellido,
          },
        })
        .from(licencia_medica)
        .leftJoin(
          EmpleadoTable,
          eq(licencia_medica.empleado_id, EmpleadoTable.id),
        )
        .leftJoin(
          UsuarioTable,
          eq(licencia_medica.revisado_por, UsuarioTable.id),
        )
        .where(eq(licencia_medica.estado_registro, estado))
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit);

      return {
        data: responseLicencias,
        pagination: {
          total: getAllRegistrosLicencias,
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

  async findLicenciaMedicaById(id: number, estado: boolean) {
    try {
      const { empleado_id, revisado_por, ...restoCamposLicencia } =
        getTableColumns(licencia_medica);

      const [response] = await this.db
        .select({
          ...restoCamposLicencia,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
          revisor: {
            id: UsuarioTable.id,
            nombre: UsuarioTable.nombre,
            apellido: UsuarioTable.apellido,
          },
        })
        .from(licencia_medica)
        .leftJoin(
          EmpleadoTable,
          eq(licencia_medica.empleado_id, EmpleadoTable.id),
        )
        .leftJoin(
          UsuarioTable,
          eq(licencia_medica.revisado_por, UsuarioTable.id),
        )
        .where(
          and(
            eq(licencia_medica.id, id),
            eq(licencia_medica.estado_registro, estado),
          ),
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(
          `No se encontró la licencia médica con id ${id}`,
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

  async createLicenciaMedica(createLicenciaMedicaDto: CreateLicenciaMedicaDto) {
    try {
      const valuesToInsert = {
        ...createLicenciaMedicaDto,
        fecha_inicio: createLicenciaMedicaDto.fecha_inicio
          .toISOString()
          .split('T')[0],
      };

      await this.db.insert(licencia_medica).values(valuesToInsert);

      return {
        message: 'Licencia médica creada correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateLicenciaMedica(
    id: number,
    updateLicenciaMedicaDto: UpdateLicenciaMedicaDto,
  ) {
    try {
      await this.findLicenciaMedicaById(id, true);

      const valuesToUpdate: any = { ...updateLicenciaMedicaDto };
      if (valuesToUpdate.fecha_inicio) {
        valuesToUpdate.fecha_inicio = valuesToUpdate.fecha_inicio
          .toISOString()
          .split('T')[0];
      }

      await this.db
        .update(licencia_medica)
        .set(valuesToUpdate)
        .where(eq(licencia_medica.id, id));

      return {
        message: 'Licencia médica actualizada correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async restoreLicenciaMedica(id: number) {
    try {
      await this.findLicenciaMedicaById(id, false);

      await this.db
        .update(licencia_medica)
        .set({ estado_registro: true })
        .where(eq(licencia_medica.id, id));

      return {
        message: 'Licencia médica restaurada correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removeLicenciaMedica(id: number) {
    try {
      await this.findLicenciaMedicaById(id, true);

      await this.db
        .update(licencia_medica)
        .set({ estado_registro: false })
        .where(eq(licencia_medica.id, id));

      return {
        message: 'Licencia médica removida correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateEstado(
    id: number,
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
  ) {
    try {
      await this.findLicenciaMedicaById(id, true);

      await this.db
        .update(licencia_medica)
        .set({ estado })
        .where(eq(licencia_medica.id, id));

      return {
        message: `Estado de licencia médica actualizado a ${estado} correctamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
