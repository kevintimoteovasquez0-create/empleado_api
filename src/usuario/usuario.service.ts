import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { v4 as uuidv4 } from 'uuid';
import { FotoService } from '../foto/foto.service';
import { EmailService } from '../email/email.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FotoDto } from '../common/dto/foto.dto';
import * as bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationUsuarioDto } from './dto/pagination-usuario.dto';
import { envs } from '../config';

@Injectable()
export class UsuarioService {

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => FotoService)) private readonly fotoService: FotoService,
    private readonly emailService: EmailService
  ) { }

  async findUniqueUsuario(id: number, estado: boolean){
    try {
      const usuario = await this.prisma.usuario.findUnique({
        include: {
          rol: {
            select: {
              nombre: true
            }
          },
          empresa: {
            select: {
              razon_social: true
            }
          }
        },
        where: { 
          id: id,
          estado_registro: estado
        }
      });

      if(!usuario){
        throw new NotFoundException(`No se encontro el usuario con id ${id}`)
      }

      return {
        ...usuario,
        imagen_url: this.fotoService.obtenerUrlCompleta('usuario', usuario.id, usuario.nombre_imagen)
      };

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async findOnebyEmail(email: string) {

    try {
      const buscarUsuarioByEmail = await this.prisma.usuario.findUnique({
        include: {
          rol: {
            select: {
              nombre: true
            }
          },
          empresa: {
            select: {
              razon_social: true
            }
          }
        },
        where: {
          email: email
        },
      })

      return {
        ...buscarUsuarioByEmail,
        imagen_url: this.fotoService.obtenerUrlCompleta('usuario', buscarUsuarioByEmail.id, buscarUsuarioByEmail.nombre_imagen)
      };

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  async getAllUsuario(paginationUsuarioDto: PaginationUsuarioDto, estado: boolean){

    try {

      const {page, limit, fechaInicio, fechaFin, rolId} = paginationUsuarioDto

      const where: any = {}

      if(fechaInicio && fechaFin){
        where.fecha_ingreso = {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      }

      if(rolId){

        const rol = await this.prisma.rol.findUnique({
          select: {
            id: true,
            nombre: true
          },
          where: {
            id: rolId
          }
        })

        if(rol){
          where.rol_id = rol.id
        }

      }

      where.estado_registro = estado

      const totalUsuario = await this.prisma.usuario.count({
        where: where
      })
      const lastPage = Math.ceil(totalUsuario / limit)
       
      const usuario = await this.prisma.usuario.findMany({
        where: where,
        skip: (page - 1) * limit,
        take: limit
      })

      return {
        data: usuario.map((user) => ({
          ...user,
          imagen_url: this.fotoService.obtenerUrlCompleta('usuario', user.id, user.nombre_imagen)
        })),
        pagination: {
          totalUsuario: totalUsuario,
          page: page,
          lastPage: lastPage
        }
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  private async usuarioExistenteAlCrear(email: string, numero_documento: string, telefono: string){

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email },
          { numero_documento: numero_documento },
          { telefono: telefono }
        ]
      },
      select: {
        email: true,
        numero_documento: true,
        telefono: true
      }
    });
  
    if (usuarioExistente) {
      const errores = [];
      if (usuarioExistente.email === email) {
        errores.push({errorEmail: "El email ya está registrado."});
      }
      if (usuarioExistente.numero_documento === numero_documento) {
        errores.push({errorNumeroDocumento: "El número de documento ya está registrado."});
      }
      if(usuarioExistente.telefono === telefono){
        errores.push({errorTelefono: "El número de telefono ya está registrado."})
      }
      throw new BadRequestException({ message: "Errores de validación", errors: errores });
    }

  }

  private async usuarioExistenteAlActualizar(id: number, email: string, numero_documento: string, telefono: string){

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        id: { not: id },
        OR: [
          { email: email },
          { numero_documento: numero_documento },
          { telefono: telefono }
        ]
      },
      select: {
        email: true,
        numero_documento: true,
        telefono: true
      }
    });
  
    if (usuarioExistente) {
      const errores = [];
      if (usuarioExistente.email === email) {
        errores.push({errorEmail: "El email ya está registrado."});
      }
      if (usuarioExistente.numero_documento === numero_documento) {
        errores.push({errorNumeroDocumento: "El número de documento ya está registrado."});
      }
      if(usuarioExistente.telefono === telefono){
        errores.push({errorTelefono: "El número de telefono ya está registrado."})
      }
      throw new BadRequestException({ message: "Errores de validación", errors: errores });
    }

  }

  async createUsuario(createUsuarioDto: CreateUsuarioDto, fotoUsuario: Express.Multer.File, empresaId: number){

    try {
      if (!fotoUsuario) {
        throw new BadRequestException(`Es necesario una foto para registrar usuario`);
      }
      
      const verificationToken = uuidv4();

      const hashedPassword = await bcrypt.hash(createUsuarioDto.numero_documento, 10);

      const nombreCompleto = `${createUsuarioDto.nombre} ${createUsuarioDto.apellido}`

      const { rol_id, ...usuarioData } = createUsuarioDto;
      
      await this.usuarioExistenteAlCrear(createUsuarioDto.email, createUsuarioDto.numero_documento, createUsuarioDto.telefono)
      
      const createUsuario = await this.prisma.usuario.create({
        data: {
          ...usuarioData,
          empresa: { connect: { id: empresaId } },
          password: hashedPassword,
          ...(rol_id ? { rol: { connect: { id: rol_id } } } : {}), // Solo conecta si rol_id tiene valor
          token_verificacion_email: verificationToken,  // Guardar el token de verificación
          token_expiry_email: new Date(Date.now() + 86400000), // El token expira en 24 horas
        }
      });
      const imagen_url = await this.fotoService.guardarImagen(createUsuario.id, 'usuario', fotoUsuario)
      //Registar foto de perfil
      await this.updateNombrefotoUsuario(createUsuario.id, { foto_url: imagen_url })
      // Enviar correo de verificación
      const verificationLink = `${envs.baseFrontendUrl}/${envs.verifyEmailPath}${verificationToken}`;
      // Usar el servicio de correo
      const emailMessage = await this.emailService.sendVerificationEmail(createUsuarioDto.email, verificationLink);
      //Enviar correo de credenciales de usuario
      const usuarioCredentialMessage = await this.emailService.sendUsuarioCredentials(createUsuarioDto.email, createUsuarioDto.numero_documento, nombreCompleto);
      return {
        message: "usuario creado correctamente",
        alerts: {
          email: emailMessage,
          usuario: usuarioCredentialMessage
        }
      }


    } catch (error) {
      throw new InternalServerErrorException(`Tenemos problemas para crear el usuario: ${error}`);
    }

  }

  async updateNombrefotoUsuario(id: number, fotoDto: FotoDto){
    try {
      const foto = await this.prisma.usuario.update({
        data: {
          nombre_imagen: fotoDto.foto_url
        },
        where: {
          id: id
        }
      })
      return foto
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async updateUsuario(id: number, updateUsuarioDto: UpdateUsuarioDto, empresaId: number, fotoUsuario?: Express.Multer.File){

    try {

      const usuario = await this.findUniqueUsuario(id, true)

      await this.usuarioExistenteAlActualizar(id, updateUsuarioDto.email, updateUsuarioDto.numero_documento, updateUsuarioDto.telefono)

      const pathUrl = await this.fotoService.actualizarImagen(usuario.id, 'usuario', usuario.nombre_imagen, fotoUsuario)

      const { rol_id, ...usuarioData } = updateUsuarioDto;
      
      const updateUsuario = await this.prisma.usuario.update({
        data: {
          ...usuarioData,
          nombre_imagen: pathUrl,
          empresa: { connect: { id: empresaId } },
          rol: { connect: { id: rol_id } }, // Conectar con tabla rol
        },
        where: {
          id: id
        }
      })

      return updateUsuario

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  async updatePasswordProfile(usuarioId: number, updatePasswordDto: UpdatePasswordDto){

    try {

      await this.findUniqueUsuario(usuarioId, true)

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(updatePasswordDto.password, 10);
      
      const updatePassword = await this.prisma.usuario.update({
        data: {
          password: hashedPassword
        },
        where: {
          id: usuarioId
        }
      })

      return updatePassword

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  async restaurarUsuario(id: number){
    try {

      await this.findUniqueUsuario(id, false)
      
      await this.prisma.usuario.update({
        data: {
          estado_registro: true
        },
        where: {
          id: id
        }
      })

      return {
        message: `Se restauro el usuario con id ${id} de manera correcta`
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async remove(id: number){
    try {

      await this.findUniqueUsuario(id, true)
      
      await this.prisma.usuario.update({
        data: {
          estado_registro: false
        },
        where: {
          id: id
        }
      })

      return {
        message: `Se elimino el usuario con id ${id} de manera correcta`
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async newTwoFactorCode(email: string) {

    try {

      const codigo: number = Math.floor(1000 + Math.random() * 9000);

      const tiempoAgregado: any = addMinutes(new Date(), 5);
      
      await this.prisma.usuario.update({
        where: { email: email, estado_registro: true },
        data: {
          two_factor_code: codigo,
          two_factor_expired: tiempoAgregado
        }
      });
      
      return await this.emailService.sendTwoFactorAuthenticateEmail(email, codigo);  
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error al habilitar : ${error}`)
    }
  }

}
