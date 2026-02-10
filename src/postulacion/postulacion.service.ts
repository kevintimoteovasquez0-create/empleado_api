import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { and, getTableColumns } from 'drizzle-orm';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { ConvocatoriaTable } from 'src/drizzle/schema/convocatoria';
import { postulacion } from 'src/drizzle/schema/postulacion';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';

@Injectable()
export class PostulacionService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDb();
  }

  async findAllPostulaciones(
    paginationDto: PaginationDto,
    estado: boolean,
    estadoPostulacion?: string,
  ) {
    try {
      const { page, limit } = paginationDto;

      const whereConditions = [eq(postulacion.estado_registro, estado)];
      if (estadoPostulacion) {
        whereConditions.push(eq(postulacion.estado, estadoPostulacion as any));
      }
      const whereCondition =
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)!;

      const [{ total }] = await this.db
        .select({ total: count() })
        .from(postulacion)
        .where(whereCondition);

      const getAllRegistrosPostulaciones = Number(total);

      const finalPage = page ?? 1;
      const finalLimit = limit ?? 10;

      const numberPages = Math.ceil(getAllRegistrosPostulaciones / finalLimit);

      const { convocatoria_id, ...restoCamposPostulacion } =
        getTableColumns(postulacion);

      const responsePostulaciones = await this.db
        .select({
          ...restoCamposPostulacion,
          convocatoria: {
            id: ConvocatoriaTable.id,
            cargo: ConvocatoriaTable.cargo,
            descripcion: ConvocatoriaTable.descripcion,
          },
        })
        .from(postulacion)
        .innerJoin(
          ConvocatoriaTable,
          eq(postulacion.convocatoria_id, ConvocatoriaTable.id),
        )
        .where(whereCondition)
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
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async findPostulacionById(id: number, estado: boolean) {
    try {
      const { convocatoria_id, ...restoCamposPostulacion } =
        getTableColumns(postulacion);

      const [response] = await this.db
        .select({
          ...restoCamposPostulacion,
          convocatoria: {
            id: ConvocatoriaTable.id,
            cargo: ConvocatoriaTable.cargo,
            descripcion: ConvocatoriaTable.descripcion,
          },
        })
        .from(postulacion)
        .innerJoin(
          ConvocatoriaTable,
          eq(postulacion.convocatoria_id, ConvocatoriaTable.id),
        )
        .where(
          and(eq(postulacion.id, id), eq(postulacion.estado_registro, estado)),
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(
          `No se encontró la postulación con id ${id}`,
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

  async createPostulacion(createPostulacionDto: CreatePostulacionDto) {
    try {
      // Verificar que la convocatoria existe y está activa
      const [convocatoria] = await this.db
        .select({ id: ConvocatoriaTable.id })
        .from(ConvocatoriaTable)
        .where(
          and(
            eq(ConvocatoriaTable.id, createPostulacionDto.convocatoria_id),
            eq(ConvocatoriaTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (!convocatoria) {
        throw new BadRequestException(
          'La convocatoria especificada no existe o no está activa.',
        );
      }

      await this.db.insert(postulacion).values(createPostulacionDto);

      return {
        message: 'Postulación creada correctamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async createPostulacionParaConvocatoria(
    convocatoriaId: number,
    createPostulacionDto: Omit<CreatePostulacionDto, 'convocatoria_id'>,
  ) {
    try {
      // Verificar que la convocatoria existe y está activa
      const [convocatoria] = await this.db
        .select({ id: ConvocatoriaTable.id })
        .from(ConvocatoriaTable)
        .where(
          and(
            eq(ConvocatoriaTable.id, convocatoriaId),
            eq(ConvocatoriaTable.estado_registro, true),
          ),
        )
        .limit(1);

      if (!convocatoria) {
        throw new BadRequestException(
          'La convocatoria especificada no existe o no está activa.',
        );
      }

      const valuesToInsert = {
        ...createPostulacionDto,
        convocatoria_id: convocatoriaId,
      };

      await this.db.insert(postulacion).values(valuesToInsert);

      return {
        message: 'Postulación creada correctamente para la convocatoria',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async updatePostulacion(
    id: number,
    updatePostulacionDto: UpdatePostulacionDto,
  ) {
    try {
      await this.findPostulacionById(id, true);

      // Validar puntaje si se proporciona
      if (
        updatePostulacionDto.puntaje !== undefined &&
        (updatePostulacionDto.puntaje < 0 || updatePostulacionDto.puntaje > 100)
      ) {
        throw new BadRequestException('El puntaje debe estar entre 0 y 100.');
      }

      await this.db
        .update(postulacion)
        .set({ ...updatePostulacionDto })
        .where(eq(postulacion.id, id));

      return {
        message: 'Postulación actualizada correctamente',
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

  async restorePostulacion(id: number) {
    try {
      await this.findPostulacionById(id, false);

      await this.db
        .update(postulacion)
        .set({ estado_registro: true })
        .where(eq(postulacion.id, id));

      return {
        message: 'Postulación restaurada correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }

  async removePostulacion(id: number) {
    try {
      await this.findPostulacionById(id, true);

      await this.db
        .update(postulacion)
        .set({ estado_registro: false })
        .where(eq(postulacion.id, id));

      return {
        message: 'Postulación removida correctamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
