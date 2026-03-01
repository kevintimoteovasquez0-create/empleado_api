import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { AreaTable } from 'src/drizzle/schema/area';
import { EmpleadoTable } from 'src/drizzle/schema/empleado';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { ValidarUniqueService } from 'src/common/validar_unique.service';
import { BaseDrizzleService } from 'src/drizzle/base_drizzle.service';

@Injectable()
export class EmpleadoService extends BaseDrizzleService{

  constructor(
    drizzleService: DrizzleService,
    private readonly validarUniqueService: ValidarUniqueService,
  ) { 
    super(drizzleService)
  }

  async findAllEmpleados(paginationDto: PaginationDto, estado: boolean, areaID?: number) {

      const { page, limit } = paginationDto

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(EmpleadoTable)
        .where(eq(EmpleadoTable.estado_registro, estado))

      const getAllRegistrosArea = Number(total)

      const pageActual = page ?? 1
      const limitActual = limit ?? 10

      const numberPages = Math.ceil(getAllRegistrosArea / limitActual)

      const { area_id, ...restoCamposArea } = getTableColumns(EmpleadoTable)

      const condiciones = [
        eq(EmpleadoTable.estado_registro, estado),
      ]

      if (areaID) {
        condiciones.push(eq(EmpleadoTable.area_id, areaID))
      }

      const responseEmpleados = await this.db
        .select({
          ...restoCamposArea,
          ...(!areaID && {
            area: {
              id: AreaTable.id,
              nombre: AreaTable.nombre
            }
          })
        })
        .from(EmpleadoTable)
        .innerJoin(AreaTable, eq(EmpleadoTable.area_id, AreaTable.id))
        .where(and(
          ...condiciones
        ))
        .limit(limitActual)
        .offset((pageActual - 1) * limitActual)

      return {
        data: responseEmpleados,
        pagination: {
          total: getAllRegistrosArea,
          page: pageActual,
          limit: limitActual,
          pageActual: numberPages
        }
      }
  }

  async findEmpleadosById(id: number, estado: boolean) {

      const { area_id, ...restoCamposArea } = getTableColumns(EmpleadoTable)

      const [response] = await this.db
        .select({
          ...restoCamposArea,
          area: {
            id: AreaTable.id,
            nombre: AreaTable.nombre
          }
        })
        .from(EmpleadoTable)
        .innerJoin(AreaTable, eq(EmpleadoTable.area_id, AreaTable.id))
        .where(
          and(
            eq(EmpleadoTable.id, id),
            eq(EmpleadoTable.estado_registro, estado))
        )
        .limit(1)

      if (!response) {
        throw new NotFoundException(`No se encontro el área con id ${id}`)
      }

      return response
  }

  async createEmpleados(createEmpleadoDto: CreateEmpleadoDto) {
    try {

      await this.validarUniqueService.validarDatosUnicos({
        dto: createEmpleadoDto,
        table: EmpleadoTable,
        idColumn: EmpleadoTable.id,
        uniqueFields: [
          { field: "numero_documento", column: EmpleadoTable.numero_documento }
        ]
      })

      await this.db
        .insert(EmpleadoTable)
        .values({ ...createEmpleadoDto })

      return {
        message: "Área creada correctamente"
      }

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updateEmpleados(id: number, updateEmpleadosDto: UpdateEmpleadoDto) {
    try {

      await this.findEmpleadosById(id, true)

      await this.validarUniqueService.validarDatosUnicos({
        dto: updateEmpleadosDto,
        table: EmpleadoTable,
        idColumn: EmpleadoTable.id,
        uniqueFields: [
          { field: "numero_documento", column: EmpleadoTable.numero_documento }
        ]
      })

      await this.db
        .update(EmpleadoTable)
        .set({ ...updateEmpleadosDto })
        .where(eq(EmpleadoTable.id, id))

      return {
        message: "Área actualizada correctamente"
      }

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async restoreEmpleados(id: number) {
    try {

      await this.findEmpleadosById(id, false)

      await this.db
        .update(EmpleadoTable)
        .set({ estado_registro: true })
        .where(eq(EmpleadoTable.id, id))

      return {
        message: "Área restaurada correctamente"
      }

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removeEmpleados(id: number) {
    try {

      await this.findEmpleadosById(id, true)

      await this.db
        .update(EmpleadoTable)
        .set({ estado_registro: false })
        .where(eq(EmpleadoTable.id, id))

      return {
        message: "Área removida correctamente"
      }

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }


  async actualizarAuditoriaProgreso() {

  }

}
