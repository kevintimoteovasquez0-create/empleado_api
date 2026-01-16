import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PaginationDto } from 'src/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { RolTable } from 'src/drizzle/schema/rol';
import { and, eq, inArray } from 'drizzle-orm';
import { AccesoTable } from 'src/drizzle/schema/acceso';
import { Rol_Acceso_Table } from 'src/drizzle/schema/rol_acceso';
import { getTableColumns } from 'drizzle-orm';
import { countDistinct } from 'drizzle-orm';

@Injectable()
export class RolService {

  constructor (private readonly drizzleService: DrizzleService) {}

  private get db(){
    return this.drizzleService.getDb()
  }

  //  Visualizar todos los roles de una empresa.
  
  async findAllRol(paginationDto: PaginationDto, estado: boolean) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const safeLimit = Math.min(100, Math.max(1, limit));
      const safePage = Math.max(1, page);

      const [{ total }] = await this.db
        .select({ total: countDistinct(RolTable.id) })
        .from(RolTable)
        .where(eq(RolTable.estado_registro, estado));

      const lastPage = Math.ceil(total / safeLimit);

      const rolesPaginados = await this.db
        .select({ id: RolTable.id })
        .from(RolTable)
        .where(eq(RolTable.estado_registro, estado))
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit);

      if (rolesPaginados.length === 0) {
        return {
          data: [],
          pagination: {
            total: total,
            page: safePage,
            limit: safeLimit,
            lastPage: lastPage
          }
        };
      }

      const rolesIds = rolesPaginados.map(r => r.id);
      
      const rolesConAccesos = await this.db
        .select({
          ...getTableColumns(RolTable),
          acceso: {
            id: AccesoTable.id,
            path: AccesoTable.path
          }
        })
        .from(RolTable)
        .leftJoin(Rol_Acceso_Table, eq(Rol_Acceso_Table.rol_id, RolTable.id))
        .leftJoin(AccesoTable, eq(Rol_Acceso_Table.acceso_id, AccesoTable.id))
        .where(
          and(
            eq(RolTable.estado_registro, estado),
            inArray(RolTable.id, rolesIds)
          )
        )
        .orderBy(RolTable.id);

      const rolesMap = new Map<number, {
        id: number;
        nombre: string;
        descripcion: string;
        estado_registro: boolean;
        created_at: Date;
        updated_at: Date;
        accesos: { id: number; path: string }[];
      }>();

      for (const rol of rolesConAccesos) {
        if (!rolesMap.has(rol.id)) {
          rolesMap.set(rol.id, {
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            estado_registro: rol.estado_registro,
            created_at: rol.created_at,
            updated_at: rol.updated_at,
            accesos: []
          });
        }

        if (rol.acceso?.id) {
          rolesMap.get(rol.id)!.accesos.push(rol.acceso);
        }
      }

      const result = rolesIds
        .map(id => rolesMap.get(id))
        .filter(Boolean);

      return {
        data: result,
        pagination: {
          total: total,
          page: safePage,
          limit: safeLimit,
          lastPage: lastPage
        }
      };

    } catch (error) {
      console.error('Error en findAllRol:', error);
      throw new InternalServerErrorException('Error al obtener roles');
    }
  }

  async findOneRol(id: number, estado: boolean) {
    try {
      const rolesConAccesos = await this.db
        .select({
          ...getTableColumns(RolTable),
          acceso: {
            id: AccesoTable.id,
            path: AccesoTable.path
          }
        })
        .from(RolTable)
        .leftJoin(Rol_Acceso_Table, eq(Rol_Acceso_Table.rol_id, RolTable.id))
        .leftJoin(AccesoTable, eq(Rol_Acceso_Table.acceso_id, AccesoTable.id))
        .where(
          and(
            eq(RolTable.id, id),
            eq(RolTable.estado_registro, estado)
          )
        );

      if (rolesConAccesos.length === 0) {
        throw new NotFoundException(`No se encontró el rol con id ${id}`);
      }

      const primerRol = rolesConAccesos[0];

      return {
        id: primerRol.id,
        nombre: primerRol.nombre,
        descripcion: primerRol.descripcion,
        estado_registro: primerRol.estado_registro,
        created_at: primerRol.created_at,
        updated_at: primerRol.updated_at,
        accesos: rolesConAccesos
          .map(rol => rol.acceso)
          .filter(acceso => acceso?.id)
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en findOneRol:', error);
      throw new InternalServerErrorException('Error al obtener el rol');
    }
  }

  //Crear rol en una empresa.
  async createRol(createDto: CreateRolDto) {

    try {

      const [createRol] = await this.db
        .insert(RolTable)
        .values({
          nombre: createDto.nombre,
          descripcion: createDto.descripcion
        })
        .returning()

      if (createDto.accesos && createDto.accesos.length > 0) {
        const accesoIds = createDto.accesos.map(acceso => acceso.id);

        await this.db
          .insert(Rol_Acceso_Table)
          .values(
            accesoIds.map(accesoId => ({
              rol_id: createRol.id,
              acceso_id: accesoId
            }))
          )
      }

      return { message: "Rol creado correctamente." };

    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }
  
  //Actualizar rol
  async updateRol(id: number, updateDto: UpdateRolDto) {

    try {

      const { nombre, accesos } = updateDto;
      const nuevosAccesosIds = accesos?.map(response => response.id) ?? [];

      if (!nombre && (!accesos || accesos.length === 0)) {
        throw new BadRequestException(
          'Debe proporcionar al menos el nombre o los accesos para actualizar'
        );
      }

      await this.findOneRol(id, true)

      if (nuevosAccesosIds.length > 0) {
        const idsUnicos = new Set(nuevosAccesosIds);
        if (idsUnicos.size !== nuevosAccesosIds.length) {
          throw new BadRequestException(
            'No se permiten accesos duplicados en la solicitud'
          );
        }
      }

      //Validar que todos los accesos existen en la base de datos
      if (nuevosAccesosIds.length > 0) {
        const accesosValidos = await this.db
          .select({ id: AccesoTable.id })
          .from(AccesoTable)
          .where(
            and(
              inArray(AccesoTable.id, nuevosAccesosIds),
              eq(AccesoTable.estado_registro, true)
            )
          );

        if (accesosValidos.length !== nuevosAccesosIds.length) {
          throw new BadRequestException(
            'Se ha encontrado uno o más accesos inexistentes o inactivos'
          );
        }
      }

      // transacción
      await this.db.transaction(async (operacion) => {

        if(nombre){
          await operacion
            .update(RolTable)
            .set({
              nombre: nombre
            })
            .where(
              eq(RolTable.id, id)
            )
        }

        if (accesos !== undefined) {

          //Obtener los accesos actuales del rol
          const accesosActuales = await operacion
            .select({
              acceso_id: Rol_Acceso_Table.acceso_id
            })
            .from(Rol_Acceso_Table)
            .innerJoin(
              AccesoTable,
              eq(AccesoTable.id, Rol_Acceso_Table.acceso_id)
            )
            .where(
              and(
                eq(Rol_Acceso_Table.rol_id, id),
                eq(AccesoTable.estado_registro, true)
              )
            );

          const accesosActualesIds = accesosActuales.map(response => response.acceso_id);

          // Determinar los accesos a eliminar (los que ya no están en la nueva lista)
          const accesosAEliminar = accesosActualesIds.filter(accesoId => !nuevosAccesosIds.includes(accesoId));

          // Determinar los accesos a agregar (los que antes no existían)
          const accesosAgregar = nuevosAccesosIds.filter(accesoId => !accesosActualesIds.includes(accesoId));

          // Eliminar accesos obsoletos
          if (accesosAEliminar.length > 0) {
            await operacion
              .delete(Rol_Acceso_Table)
              .where(
                and (
                  eq(Rol_Acceso_Table.rol_id, id),
                  inArray(Rol_Acceso_Table.acceso_id, accesosAEliminar)
                )
              )
          }

          // Agregar nuevos accesos
          if (accesosAgregar.length > 0) {
            await operacion
              .insert(Rol_Acceso_Table)
              .values(
                accesosAgregar.map(accesoId => ({
                  rol_id: id,
                  acceso_id: accesoId
                }))
              );
          }
        }
      });

      return { message: "Rol actualizado correctamente." };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Ocurrió un error al actualizar el rol: ${error.message}`
      );
    }
  }

  async restaurarRol(id: number) {
    try {

      await this.findOneRol(id, false)

      await this.db
        .update(RolTable)
        .set({
          estado_registro: true
        })
        .where(
          eq(RolTable.id, id)
        )

      return { message: 'Rol restaurado exitosamente. '};
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

  async remove(id: number) {
    try {

      await this.findOneRol(id, true)

      await this.db
        .update(RolTable)
        .set({
          estado_registro: false
        })
        .where(
          eq(RolTable.id, id)
        )

      return { message: 'Rol eliminado exitosamente. '};
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

}
