import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class RolService {
  constructor (private readonly prisma: PrismaService) {}

  //  Visualizar todos los roles de una empresa.
  async findAllRol(paginationDto: PaginationDto, estado: boolean) {

    try {

      const {page, limit} = paginationDto

      const totalPages = await this.prisma.rol.count({
        where: {
          estado_registro: estado
        }
      })
      const lastPage = Math.ceil(totalPages / limit)

      const roles = await this.prisma.rol.findMany({
        include: {
          rolAcceso: {
            select: {
              acceso: {
                select: {
                  id: true,
                  path: true
                }
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        where: {
          estado_registro: estado
        }
      })

      const rolesConAccesos = roles.map(rol => ({
        rol: {
          id: rol.id,
          nombre: rol.nombre,
          estado_registro: rol.estado_registro
        },
        accesos: rol.rolAcceso.map(a => a.acceso)
      }));
    
      return {
        data: rolesConAccesos,
        pagination: {
          totalPages: totalPages,
          page: page,
          lastPage: lastPage
        }
      };

    
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

  async findOneRol(id: number, estado: boolean){
    try {
      
      const rol = await this.prisma.rol.findUnique({
        where: {
          id: id,
          estado_registro: estado
        },
        include: {
          rolAcceso: {
            select: {
              acceso: {
                select: {
                  id: true,
                  path: true
                }
              }
            }
          }
        }
      })

      if(!rol){
        throw new NotFoundException(`No se encontro el rol con id ${id}`)
      }

      return {
        data: {
          rol: {
            id: rol.id,
            nombre: rol.nombre,
            estado_registro: rol.estado_registro
          },
          accesos: rol.rolAcceso.map(a => a.acceso)
        }
      }

    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  //Crear rol en una empresa.
  async createRol(createDto: CreateRolDto) {

    try {
      const createRol = await this.prisma.rol.create({
        data: {
          nombre: createDto.nombre
        }
      });

      if (createDto.accesos && createDto.accesos.length > 0) {
        const accesoIds = createDto.accesos.map(acceso => acceso.id);

        await this.prisma.rol_Acceso.createMany({
          data: accesoIds.map(accesoId => ({
            rol_id: createRol.id,
            acceso_id: accesoId
          }))
        })
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

      this.findOneRol(id, true)

      await this.prisma.rol.update({
        where: {
          id: id
        },
        data: {
          nombre: nombre
        }
      })

      //Obtener los accesos actuales del rol
      const accesosActuales = await this.prisma.rol_Acceso.findMany({
        where: { rol_id: id },
        select: { acceso_id: true }
      });

      const accesosActualesIds = accesosActuales.map(a => a.acceso_id);
      const nuevosAccesosIds = accesos.map(a => a.id);

      // Determinar los accesos a eliminar (los que ya no están en la nueva lista)
      const accesosAEliminar = accesosActualesIds.filter(id => !nuevosAccesosIds.includes(id));

      // Determinar los accesos a agregar (los que antes no existían)
      const accesosAgregar = nuevosAccesosIds.filter(id => !accesosActualesIds.includes(id));

      // Eliminar solo los accesos que ya no están en la nueva lista
      if (accesosAEliminar.length > 0) {
        await this.prisma.rol_Acceso.deleteMany({
          where: {
            rol_id: id,
            acceso_id: { in: accesosAEliminar }
          }
        });
      }

      // Agregar solo los accesos nuevos que antes no existían
      if (accesosAgregar.length > 0) {
        await this.prisma.rol_Acceso.createMany({
          data: accesosAgregar.map(accesoId => ({
            rol_id: id,
            acceso_id: accesoId
          }))
        });
      }

      return { message: "Rol actualizado correctamente." };
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

  async restaurarRol(id: number) {
    try {

      this.findOneRol(id, false)

      await this.prisma.rol.update({
        where: { 
          id: id 
        },
        data: { 
          estado_registro: true 
        }
      });

      return { message: 'Rol restaurado exitosamente. '};
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

  async remove(id: number) {
    try {

      this.findOneRol(id, true)

      await this.prisma.rol.update({
        where: { 
          id: id 
        },
        data: { 
          estado_registro: false 
        }
      });

      return { message: 'Rol eliminado exitosamente. '};
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error con el sistema: ${error}`);
    }
  }

}
