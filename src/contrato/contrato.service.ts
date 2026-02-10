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
import { contrato } from 'src/drizzle/schema/contrato';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Injectable()
export class ContratoService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllContratos(paginationDto: PaginationDto, estado: boolean) {
    try {
      const { page, limit } = paginationDto;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(contrato)
        .where(eq(contrato.estado_registro, estado));

      const getAllRegistrosContratos = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistrosContratos / finalLimit);

      const { empleado_id, ...restoCamposContrato } = getTableColumns(contrato);

      const responseContratos = await this.db
        .select({
          ...restoCamposContrato,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
        })
        .from(contrato)
        .innerJoin(EmpleadoTable, eq(contrato.empleado_id, EmpleadoTable.id))
        .where(eq(contrato.estado_registro, estado))
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
      const { empleado_id, ...restoCamposContrato } = getTableColumns(contrato);

      const [response] = await this.db
        .select({
          ...restoCamposContrato,
          empleado: {
            id: EmpleadoTable.id,
            nombres: EmpleadoTable.nombres,
            apellidos: EmpleadoTable.apellidos,
          },
        })
        .from(contrato)
        .innerJoin(EmpleadoTable, eq(contrato.empleado_id, EmpleadoTable.id))
        .where(and(eq(contrato.id, id), eq(contrato.estado_registro, estado)))
        .limit(1);

      if (!response) {
        throw new NotFoundException(`No se encontró el contrato con id ${id}`);
      }

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createContrato(createContratoDto: CreateContratoDto) {
    try {
      // Validar que las fechas sean consistentes
      if (
        createContratoDto.fecha_fin &&
        createContratoDto.fecha_inicio >= createContratoDto.fecha_fin
      ) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio.',
        );
      }

      const valuesToInsert = {
        ...createContratoDto,
        fecha_inicio: createContratoDto.fecha_inicio
          .toISOString()
          .split('T')[0],
        fecha_fin: createContratoDto.fecha_fin
          ? createContratoDto.fecha_fin.toISOString().split('T')[0]
          : null,
        sueldo_bruto: createContratoDto.sueldo_bruto.toString(),
      };

      await this.db.insert(contrato).values(valuesToInsert);

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
      // Validar que las fechas sean consistentes si se proporcionan
      if (
        updateContratoDto.fecha_fin &&
        updateContratoDto.fecha_inicio &&
        updateContratoDto.fecha_inicio >= updateContratoDto.fecha_fin
      ) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio.',
        );
      }

      await this.findContratoById(id, true);

      const valuesToUpdate: any = { ...updateContratoDto };
      if (valuesToUpdate.fecha_inicio) {
        valuesToUpdate.fecha_inicio = valuesToUpdate.fecha_inicio
          .toISOString()
          .split('T')[0];
      }
      if (valuesToUpdate.fecha_fin) {
        valuesToUpdate.fecha_fin = valuesToUpdate.fecha_fin
          .toISOString()
          .split('T')[0];
      }
      if (valuesToUpdate.sueldo_bruto) {
        valuesToUpdate.sueldo_bruto = valuesToUpdate.sueldo_bruto.toString();
      }

      await this.db
        .update(contrato)
        .set(valuesToUpdate)
        .where(eq(contrato.id, id));

      return {
        message: 'Contrato actualizado correctamente',
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

  async restoreContrato(id: number) {
    try {
      await this.findContratoById(id, false);

      await this.db
        .update(contrato)
        .set({ estado_registro: true })
        .where(eq(contrato.id, id));

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
        .update(contrato)
        .set({ estado_registro: false })
        .where(eq(contrato.id, id));

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
