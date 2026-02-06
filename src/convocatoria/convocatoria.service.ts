import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { PaginationConvocatoriaDto } from './dto/pagination-convocatoria.dto';
import { ConvocatoriaTable } from 'src/drizzle/schema/convocatoria';
import { and, count, eq } from 'drizzle-orm';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { alias } from 'drizzle-orm/pg-core';
import { AreaTable } from 'src/drizzle/schema/area';

@Injectable()
export class ConvocatoriaService {

  constructor(private readonly drizzleService: DrizzleService) { }

  private get db() {
    return this.drizzleService.getDb()
  }

  async findAllConvocatorias(paginationConvocatoriaDto: PaginationConvocatoriaDto, estado: boolean) {
    try {

      const { page, limit, tipo_empleado } = paginationConvocatoriaDto;

      const safeLimit = limit ?? 10;
      const safePage = page ?? 1;

      const whereConditions: any[] = [
        eq(ConvocatoriaTable.estado_registro, estado)
      ];

      if (tipo_empleado) {
        whereConditions.push(eq(ConvocatoriaTable.tipo_empleado, tipo_empleado));
      }

      const [{ value }] = await this.db
        .select({ value: count(ConvocatoriaTable.id) })
        .from(ConvocatoriaTable)
        .where(and(...whereConditions));

      const totalConvocatoria = Number(value);
      const lastPage = Math.ceil(totalConvocatoria / safeLimit);

      const UsuarioCreador = alias(UsuarioTable, 'usuario_creador');
      const UsuarioResponsable = alias(UsuarioTable, 'usuario_responsable');

      const response = await this.db
        .select({
          id: ConvocatoriaTable.id,
          usuario_creador: {
            id: UsuarioCreador.id,
            nombre: UsuarioCreador.nombre,
            apellido: UsuarioCreador.apellido
          },
          usuario_responsable: {
            id: UsuarioResponsable.id,
            nombre: UsuarioResponsable.nombre,
            apellido: UsuarioResponsable.apellido
          },
          area: {
            id: AreaTable.id,
            nombre: AreaTable.nombre,
            descripcion: AreaTable.descripcion
          },
          cargo: ConvocatoriaTable.cargo,
          tipo_empleado: ConvocatoriaTable.tipo_empleado,
          modalidad: ConvocatoriaTable.modalidad,
          descripcion: ConvocatoriaTable.descripcion,
          remuneracion: ConvocatoriaTable.remuneracion,
          es_a_convenir: ConvocatoriaTable.es_a_convenir,
          fecha_finalizacion: ConvocatoriaTable.fecha_finalizacion,
          estado_registro: ConvocatoriaTable.estado_registro,
          created_at: ConvocatoriaTable.created_at,
          updated_at: ConvocatoriaTable.updated_at
        })
        .from(ConvocatoriaTable)
        .leftJoin(UsuarioCreador, eq(ConvocatoriaTable.usuario_id, UsuarioCreador.id))
        .leftJoin(UsuarioResponsable, eq(ConvocatoriaTable.responsable_id, UsuarioResponsable.id))
        .leftJoin(AreaTable, eq(ConvocatoriaTable.area_id, AreaTable.id))
        .where(and(...whereConditions))
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit);

      return {
        data: response,
        pagination: {
          totalConvocatoria: totalConvocatoria,
          page: safePage,
          limit: safeLimit,
          lastPage: lastPage
        },
      };

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOneConvocatoriaById(id: number, estado: boolean) {
    try {

      const UsuarioCreador = alias(UsuarioTable, 'usuario_creador');
      const UsuarioResponsable = alias(UsuarioTable, 'usuario_responsable');

      const [response] = await this.db
        .select({
          id: ConvocatoriaTable.id,
          usuario_creador: {
            id: UsuarioCreador.id,
            nombre: UsuarioCreador.nombre,
            apellido: UsuarioCreador.apellido
          },
          usuario_responsable: {
            id: UsuarioResponsable.id,
            nombre: UsuarioResponsable.nombre,
            apellido: UsuarioResponsable.apellido
          },
          area: {
            id: AreaTable.id,
            nombre: AreaTable.nombre,
            descripcion: AreaTable.descripcion
          },
          cargo: ConvocatoriaTable.cargo,
          tipo_empleado: ConvocatoriaTable.tipo_empleado,
          modalidad: ConvocatoriaTable.modalidad,
          descripcion: ConvocatoriaTable.descripcion,
          remuneracion: ConvocatoriaTable.remuneracion,
          es_a_convenir: ConvocatoriaTable.es_a_convenir,
          fecha_finalizacion: ConvocatoriaTable.fecha_finalizacion,
          estado_registro: ConvocatoriaTable.estado_registro,
          created_at: ConvocatoriaTable.created_at,
          updated_at: ConvocatoriaTable.updated_at
        })
        .from(ConvocatoriaTable)
        .leftJoin(UsuarioCreador, eq(ConvocatoriaTable.usuario_id, UsuarioCreador.id))
        .leftJoin(UsuarioResponsable, eq(ConvocatoriaTable.responsable_id, UsuarioResponsable.id))
        .leftJoin(AreaTable, eq(ConvocatoriaTable.area_id, AreaTable.id))
        .where(
          and(
            eq(ConvocatoriaTable.id, id),
            eq(ConvocatoriaTable.estado_registro, estado)
          )
        )
        .limit(1);

      if (!response) {
        throw new NotFoundException(`No se encontro la convocatoria con id ${id}`)
      }

      return response

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async createConvocatoria(createConvocatoriaDto: CreateConvocatoriaDto) {
    try {

      const { remuneracion, es_a_convenir } = createConvocatoriaDto;

      const remuneraciones = remuneracion === 0 
      ? null 
      : remuneracion;
    
      if (!es_a_convenir && (remuneraciones == null || remuneraciones <= 0)) {
          throw new BadRequestException(
              'La remuneración es obligatoria cuando no es a convenir'
          );
      }
      
      if (es_a_convenir && remuneraciones != null) {
          throw new BadRequestException(
              'No se debe especificar remuneración cuando es a convenir'
          );
      }

      await this.db
        .insert(ConvocatoriaTable)
        .values({
          ...createConvocatoriaDto,
          remuneracion: remuneraciones != null ? remuneraciones.toString() : null
        });

      return {
        message: "Convocatoria creada correctamente"
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async updateConvocatoria(id, updateConvocatoriaDto) {
    try {

      await this.findOneConvocatoriaById(id, true)

      const { remuneracion, es_a_convenir } = updateConvocatoriaDto;

      const remuneraciones = remuneracion === 0 
      ? null 
      : remuneracion;
    
      // Validación de negocio
      if (!es_a_convenir && (remuneraciones == null || remuneraciones <= 0)) {
          throw new BadRequestException(
              'La remuneración es obligatoria cuando no es a convenir'
          );
      }
      
      if (es_a_convenir && remuneraciones != null) {
          throw new BadRequestException(
              'No se debe especificar remuneración cuando es a convenir'
          );
      }

      await this.db
        .update(ConvocatoriaTable)
        .set({
          ...updateConvocatoriaDto,
          remuneracion: es_a_convenir ? null : remuneraciones?.toString(),
          updated_at: new Date()
        })
        .where(
          eq(ConvocatoriaTable.id, id)
        );

      return {
        message: `La convocatoria con id ${id} ha sido actualizada correctamente`
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async removeConvocatoria(id: number) {
    try {

      await this.findOneConvocatoriaById(id, true)

      await this.db
        .update(ConvocatoriaTable)
        .set({
          estado_registro: false,
          updated_at: new Date()
        })
        .where(
          eq(ConvocatoriaTable.id, id)
        )

      return {
        message: `La convocatoria con id ${id} ha sido eliminada correctamente`
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async restoreConvocatoria(id: number){
    try {

      await this.findOneConvocatoriaById(id, false)

      await this.db
        .update(ConvocatoriaTable)
        .set({
          estado_registro: false,
          updated_at: new Date()
        })
        .where(
          eq(ConvocatoriaTable.id, id)
        )

      return {
        message: `La convocatoria con id ${id} ha sido restaurada correctamente`
      }

    } catch(error) {
      throw new InternalServerErrorException(error)
    }
  }

}
