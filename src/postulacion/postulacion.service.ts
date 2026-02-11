import {Injectable, NotFoundException, InternalServerErrorException, HttpException} from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { ConvocatoriaTable } from 'src/drizzle/schema/convocatoria';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { PostulacionTable } from 'src/drizzle/schema/postulacion';
import { AreaTable } from 'src/drizzle/schema/area';
import { UpdateEstadoPostulacionDto } from './dto/update-estado-postulacion.dto';

@Injectable()
export class PostulacionService {
  constructor(
    private readonly drizzleService: DrizzleService,
  ) { }

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllPostulaciones(paginationDto: PaginationDto, estado: boolean, areaId?: number, convocatoriaId?: number
  ) {
    try {
      const { page, limit } = paginationDto;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(PostulacionTable)
        .where(eq(PostulacionTable.estado_registro, estado));

      const getAllRegistrosPostulaciones = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistrosPostulaciones / finalLimit);

      const { convocatoria_id, ...restoCamposPostulacion } = getTableColumns(PostulacionTable);

      const condiciones = [
        eq(PostulacionTable.estado_registro, estado)
      ]

      if (areaId) {
        condiciones.push(eq(AreaTable.id, areaId))
      }

      if (convocatoriaId) {
        condiciones.push(eq(PostulacionTable.convocatoria_id, convocatoriaId))
      }

      const responsePostulaciones = await this.db
        .select({
          ...restoCamposPostulacion,
          ...(!convocatoriaId && {
            convocatoria: {
              id: ConvocatoriaTable.id,
              cargo: ConvocatoriaTable.cargo,
              descripcion: ConvocatoriaTable.descripcion,
            }
          })
        })
        .from(PostulacionTable)
        .innerJoin(ConvocatoriaTable, eq(PostulacionTable.convocatoria_id, ConvocatoriaTable.id))
        .innerJoin(AreaTable, eq(ConvocatoriaTable.area_id, AreaTable.id))
        .where(and(...condiciones))
        .limit(finalLimit)
        .offset((finalPage - 1) * finalLimit);

      return {
        data: responsePostulaciones,
        pagination: {
          total: getAllRegistrosPostulaciones,
          page: finalPage,
          limit: finalLimit,
          finalPage: numberPages,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async findPostulacionById(id: number, estado: boolean) {
    try {
      const { convocatoria_id, ...restoCamposPostulacion } =
        getTableColumns(PostulacionTable);

      const [response] = await this.db
        .select({
          ...restoCamposPostulacion,
          convocatoria: {
            id: ConvocatoriaTable.id,
            cargo: ConvocatoriaTable.cargo,
            descripcion: ConvocatoriaTable.descripcion,
          },
        })
        .from(PostulacionTable)
        .innerJoin(ConvocatoriaTable, eq(PostulacionTable.convocatoria_id, ConvocatoriaTable.id))
        .where(
          and(
            eq(PostulacionTable.id, id),
            eq(PostulacionTable.estado_registro, estado)
          )
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(
          `No se encontró la postulación con id ${id}`,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createPostulacion(idConvocatoria: number, createPostulacionDto: CreatePostulacionDto) {
    try {

      await this.db
        .insert(PostulacionTable)
        .values({
          ...createPostulacionDto,
          convocatoria_id: idConvocatoria
        });

      return {
        message: 'Postulación creada correctamente',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async evaluarEstadoPostulacion(id: number, updateEstadoPostulacionDto: UpdateEstadoPostulacionDto) {
    try {
      await this.findPostulacionById(id, true)
      await this.db
        .update(PostulacionTable)
        .set({ ...updateEstadoPostulacionDto })
        .where(eq(PostulacionTable.id, id))
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removePostulacion(id: number) {
    try {
      await this.findPostulacionById(id, true);

      await this.db
        .update(PostulacionTable)
        .set({ estado_registro: false })
        .where(eq(PostulacionTable.id, id));

      return {
        message: 'Postulación removida correctamente',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
