import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { EmpleadoTable } from 'src/drizzle/schema/empleado';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ContratoTable } from 'src/drizzle/schema/contrato';

@Injectable()
export class ContratoService {
  constructor(private readonly drizzleService: DrizzleService) { }

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllContratos(paginationDto: PaginationDto, estado: boolean) {
    try {
      const { page, limit } = paginationDto;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(ContratoTable)
        .where(eq(ContratoTable.estado_registro, estado));

      const getAllRegistrosContratos = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistrosContratos / finalLimit);

      const { empleado_id, ...restoCamposContrato } = getTableColumns(ContratoTable);

      const responseContratos = await this.db
        .select({
          ...restoCamposContrato,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
        })
        .from(ContratoTable)
        .innerJoin(EmpleadoTable, eq(ContratoTable.empleado_id, EmpleadoTable.id))
        .where(eq(ContratoTable.estado_registro, estado))
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit);

      return {
        data: responseContratos,
        pagination: {
          total: getAllRegistrosContratos,
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

  async findContratoById(id: number, estado: boolean) {
    try {
      const { empleado_id, ...restoCamposContrato } = getTableColumns(ContratoTable);

      const [response] = await this.db
        .select({
          ...restoCamposContrato,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
        })
        .from(ContratoTable)
        .innerJoin(EmpleadoTable, eq(ContratoTable.empleado_id, EmpleadoTable.id))
        .where(and(eq(ContratoTable.id, id), eq(ContratoTable.estado_registro, estado)))
        .limit(1);

      if (!response) {
        throw new NotFoundException(`No se encontró el contrato con id ${id}`);
      }

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createContrato(createContratoDto: CreateContratoDto) {
    try {

      const { sueldo_bruto, fecha_inicio, fecha_fin, ...restoCamposContrato } = createContratoDto

      if (fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
        throw new BadRequestException("La fecha inicio no puede ser mayor a la fecha fin")
      }

      await this.db
        .insert(ContratoTable)
        .values({
          ...restoCamposContrato,
          fecha_inicio: fecha_inicio.toISOString().split('T')[0],
          fecha_fin: fecha_fin?.toISOString().split('T')[0],
          sueldo_bruto: sueldo_bruto.toFixed(2)
        });

      return {
        message: 'Contrato creado correctamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateContrato(id: number, updateContratoDto: UpdateContratoDto) {
    try {

      const dataContrato = await this.findContratoById(id, true);

      const { sueldo_bruto, fecha_inicio, fecha_fin, ...restoCamposContrato } = updateContratoDto

      const fecha_inicio_default = fecha_inicio ?? new Date(dataContrato.fecha_inicio)

      const fecha_fin_default = fecha_fin ?? (dataContrato.fecha_fin ? new Date(dataContrato.fecha_fin) : null);

      if (!fecha_fin_default) {
        throw new BadRequestException("Fecha fin inválida");
      }

      if (fecha_fin && new Date(fecha_inicio_default) > new Date(fecha_fin_default)) {
        throw new BadRequestException("La fecha inicio no puede ser mayor a la fecha fin")
      }

      await this.db
        .update(ContratoTable)
        .set({
          ...restoCamposContrato,
          fecha_inicio: fecha_inicio_default.toISOString().split('T')[0],
          fecha_fin: fecha_fin_default.toISOString().split('T')[0],
          sueldo_bruto: sueldo_bruto?.toFixed(2)
        })
        .where(eq(ContratoTable.id, id));

      return {
        message: 'Contrato actualizado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async restoreContrato(id: number) {
    try {
      await this.findContratoById(id, false);

      await this.db
        .update(ContratoTable)
        .set({ estado_registro: true })
        .where(eq(ContratoTable.id, id));

      return {
        message: 'Contrato restaurado correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removeContrato(id: number) {
    try {
      await this.findContratoById(id, true);

      await this.db
        .update(ContratoTable)
        .set({ estado_registro: false })
        .where(eq(ContratoTable.id, id));

      return {
        message: 'Contrato removido correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
