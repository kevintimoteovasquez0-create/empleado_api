import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { v4 as uuidv4 } from 'uuid';
import { FotoService } from '../foto/foto.service';
import { EmailService } from '../email/email.service';
import { FotoDto } from '../common/dto/foto.dto';
import * as bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationUsuarioDto } from './dto/pagination-usuario.dto';
import { envs } from '../config';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { RolTable } from 'src/drizzle/schema/rol';
import { EmpresaTable } from 'src/drizzle/schema/empresa';
import { and, eq, ne, or, SQL } from 'drizzle-orm';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {

  private readonly db;

  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(forwardRef(() => FotoService)) private readonly fotoService: FotoService,
    private readonly emailService: EmailService
  ) { 
    this.db = drizzleService.getDb();
  }

  async findUniqueUsuario(id: number, estado: boolean){
    try {
      const usuario = await this.db
        .select({
          ...UsuarioTable,
          rol: {
            nombre: RolTable.nombre,
          },
          empresa: {
            razon_social: EmpresaTable.razon_social
          }
        })
        .from(UsuarioTable)
        .innerJoin(RolTable, eq(UsuarioTable.rol_id, RolTable.id))
        .innerJoin(EmpresaTable, eq(UsuarioTable.empresa_id, EmpresaTable.id))
        .where(
          and(
            eq(UsuarioTable.id, id),
            eq(UsuarioTable.estado_registro, estado)
          )
        )
        .limit(1)

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

      const buscarUsuarioByEmail = await this.db
        .select({
          ...UsuarioTable,
          rol: {
            nombre: RolTable.nombre
          },
          empresa: {
            razon_social: EmpresaTable.razon_social
          }
        })
        .innerJoin(RolTable, eq(UsuarioTable.rol_id, RolTable.id))
        .innerJoin(EmpresaTable, eq(UsuarioTable.empresa_id, EmpresaTable.id))
        .where(
          eq(UsuarioTable.email, email)
        )
        .limit(1)

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

      const safeLimit = limit ?? 10;
      const safePage = page ?? 1;

      const where: any = {}

      if(fechaInicio && fechaFin){
        where.fecha_ingreso = {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      }

      if(rolId){

        const rol = await this.db
          .select({
            id: RolTable.id,
            nombre: RolTable.nombre
          })
          .from(RolTable)
          .where(eq(RolTable.id, rolId))
          .limit(1);

        if(rol){
          where.rol_id = rol.id
        }

      }

      where.estado_registro = estado

      const totalUsuario = await this.db
        .select({ count: this.db.fn.count() })
        .from(UsuarioTable)
        .where(where)

      const lastPage = Math.ceil(totalUsuario / safeLimit)
       

      const usuario = await this.db
        .select()
        .from(UsuarioTable)
        .where(where)
        .limit(limit)
        .offset((safePage - 1) * safeLimit)

      return {
        data: usuario.map((user) => ({
          ...user,
          imagen_url: this.fotoService.obtenerUrlCompleta('usuario', user.id, user.nombre_imagen)
        })),
        pagination: {
          totalUsuario: totalUsuario,
          page: safePage,
          lastPage: lastPage
        }
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  private async usuarioExistenteAlCrear(email: string, numero_documento: string, telefono: string){

    const usuarioExistente = await this.db
      .select({
        email: UsuarioTable.email,
        numero_documento: UsuarioTable.numero_documento,
        telefono: UsuarioTable.telefono
      })
      .from(UsuarioTable)
      .where(
        or(
          eq(UsuarioTable.email, email),
          eq(UsuarioTable.numero_documento, numero_documento),
          eq(UsuarioTable.telefono, telefono)
        )
      )
  
    if (usuarioExistente) {
      const errores: Record<string, string>[] = [];
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

  private async usuarioExistenteAlActualizar(id: number, email?: string, numero_documento?: string, telefono?: string){

    const condiciones: SQL[] = [];

    if (email) {
      condiciones.push(eq(UsuarioTable.email, email));
    }
    if (numero_documento) {
      condiciones.push(eq(UsuarioTable.numero_documento, numero_documento));
    }
    if (telefono) {
      condiciones.push(eq(UsuarioTable.telefono, telefono));
    }
    
    if (condiciones.length === 0) {
      return;
    }

    const usuarioExistente = await this.db
      .select({
        email: UsuarioTable.email,
        numero_documento: UsuarioTable.numero_documento,
        telefono: UsuarioTable.telefono
      })
      .from(UsuarioTable)
      .where(
        and(
          ne(UsuarioTable.id, id),
          or(...condiciones)
        )
      )
  
    if (usuarioExistente) {
      const errores: Record<string, string>[] = [];
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
      
      const [createUsuario] = await this.db
        .insert(UsuarioTable)
        .values({
          ...usuarioData,
          empresa_id: empresaId,
          password: hashedPassword,
          rol_id: rol_id,
          token_verificacion_email: verificationToken,
          token_expiry_email: new Date(Date.now() + 86400000)
        })
        .returning()
        
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

      const [foto] = await this.db
        .update(UsuarioTable)
        .set({
          nombre_imagen: fotoDto.foto_url
        })
        .where(
          eq(UsuarioTable.id, id)
        )
        .returning()

      return foto
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async updateUsuario(id: number, updateUsuarioDto: UpdateUsuarioDto, empresaId: number, fotoUsuario?: Express.Multer.File){

    try {

      const { email, numero_documento, telefono } = updateUsuarioDto

      const usuario = await this.findUniqueUsuario(id, true)

      await this.usuarioExistenteAlActualizar(id, email, numero_documento, telefono)

      const pathUrl = await this.fotoService.actualizarImagen(usuario.id, 'usuario', usuario.nombre_imagen, fotoUsuario)

      const { rol_id, ...usuarioData } = updateUsuarioDto;

      const updateUsuario = await this.db
        .update(UsuarioTable)
        .set({
          ...usuarioData,
          nombre_imagen: pathUrl,
          empresa_id: empresaId,
          rol_id: rol_id, // Conectar con tabla rol
        })
        .where(
          eq(UsuarioTable.id, id)
        )

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
      
      const [updatePassword] = await this.db
        .update(UsuarioTable)
        .set({
          password: hashedPassword
        })
        .where(
          eq(UsuarioTable.id, usuarioId)
        )
        .returning()

      return updatePassword

    } catch (error) {
      throw new InternalServerErrorException(error)
    }

  }

  async restaurarUsuario(id: number){
    try {

      await this.findUniqueUsuario(id, false)

      await this.db
        .update(UsuarioTable)
        .set({
          estado_registro: true
        })
        .where(
          eq(UsuarioTable.id, id)
        )

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
      
      await this.db
        .update(UsuarioTable)
        .set({
          estado_registro: false
        })
        .where(
          eq(UsuarioTable.id, id)
        )

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
      
      await this.db
        .update(UsuarioTable)
        .set({
          two_factor_code: codigo,
          two_factor_expired: tiempoAgregado
        })
        .where(
          and(
            eq(UsuarioTable.email, email),
            eq(UsuarioTable.estado_registro, true)
          )
        )
      
      return await this.emailService.sendTwoFactorAuthenticateEmail(email, codigo);  
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error al habilitar : ${error}`)
    }
  }

}
