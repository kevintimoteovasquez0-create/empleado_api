import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { AreaTable } from 'src/drizzle/schema/area';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { EmpleadoService } from 'src/empleado/empleado.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PostulacionService } from 'src/postulacion/postulacion.service';

@Injectable()
export class AreaService {

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly empleadoService: EmpleadoService,
    private readonly postulacionService: PostulacionService
  ) { }

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllAreas(paginationDto: PaginationDto, estado: boolean) {
    try {

      const { page, limit } = paginationDto

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(AreaTable)
        .where(eq(AreaTable.estado_registro, estado))

      const getAllRegistrosArea = Number(total)

      const finalPage = page ?? 1
      const finalLimit = limit ?? 10

      const numberPages = Math.ceil(getAllRegistrosArea / finalLimit)

      const { responsable_id, ...restoCamposArea } = getTableColumns(AreaTable)

      const responseAreas = await this.db
        .select({
          ...restoCamposArea,
          responsable: {
            id: UsuarioTable.id,
            nombre: UsuarioTable.nombre
          }
        })
        .from(AreaTable)
        .innerJoin(UsuarioTable, eq(AreaTable.responsable_id, UsuarioTable.id))
        .where(eq(AreaTable.estado_registro, estado))
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit)

      return {
        data: responseAreas,
        pagination: {
          tota: getAllRegistrosArea,
          page: finalPage,
          limit: finalLimit,
          finalPage: numberPages
        }
      }

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async findAreasById(id: number, estado: boolean) {
    try {

      const { responsable_id, ...restoCamposArea } = getTableColumns(AreaTable)

      const [response] = await this.db
        .select({
          ...restoCamposArea,
          responsable: {
            id: UsuarioTable.id,
            nombre: UsuarioTable.nombre
          }
        })
        .from(AreaTable)
        .innerJoin(UsuarioTable, eq(AreaTable.responsable_id, UsuarioTable.id))
        .where(
          and(
            eq(AreaTable.id, id),
            eq(AreaTable.estado_registro, estado)
          )
        )
        .limit(1)

      if (!response) {
        throw new NotFoundException(`No se encontro la área con id ${id}`)
      }

      return response

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createAreas(createAreaDto: CreateAreaDto) {
    try {

      await this.db
        .insert(AreaTable)
        .values({ ...createAreaDto })

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

  async updateAreas(id: number, updateAreaDto: UpdateAreaDto) {
    try {
      await this.findAreasById(id, true)

      await this.db
        .update(AreaTable)
        .set({ ...updateAreaDto })
        .where(eq(AreaTable.id, id))

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

  async restoreAreas(id: number) {
    try {

      await this.findAreasById(id, false)

      await this.db
        .update(AreaTable)
        .set({ estado_registro: true })
        .where(eq(AreaTable.id, id))

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

  async removeAreas(id: number) {
    try {

      await this.findAreasById(id, true)

      await this.db
        .update(AreaTable)
        .set({ estado_registro: false })
        .where(eq(AreaTable.id, id))

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

  //Funciones extras

  async obtenerEmpleadosAreas(id: number, estado: boolean, paginationDto: PaginationDto) {
    try {
      await this.findAreasById(id, true)
      return this.empleadoService.findAllEmpleados(paginationDto, estado, id)
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async obtenerPostulacionesAreas(id: number, estado: boolean, paginationDto: PaginationDto) {
    try {
      await this.findAreasById(id, true)
      return this.postulacionService.findAllPostulaciones(paginationDto, estado, id)
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

}
