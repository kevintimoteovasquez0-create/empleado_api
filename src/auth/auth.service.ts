import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailDto } from 'src/email/dto/email.dto';
import { format } from 'date-fns';
import { TwoFactorAuth } from './dto/two_factor_auth.dto';
import { envs } from 'src/config';
import { Response } from 'express';
import { AuthPayload } from './interfaces/auth-payload';
import { AuthRequest } from './interfaces/auth-request';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {

  private readonly db;

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly emailService: EmailService,
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {
    this.db = drizzleService.getDb();
  }

  async obtenerInfoUsuario(id){
    const usuario = await this.usuarioService.findUniqueUsuario(id, true);
    return {
      data: usuario
    }
  }

  async generateToken(data: AuthPayload) {
    try {
      const payload = data
      const token = await this.jwtService.signAsync(payload);
      return token;
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error al obtener el token: ${error}`);
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    try {

      const usuario = await this.usuarioService.findOnebyEmail(loginDto.email);

      const mensajeError = 'Correo o contraseña incorrectos';

      if (!usuario || usuario.verificado_email == false) {
        throw new UnauthorizedException(mensajeError);
      }

      const encontrarClave = await bcrypt.compare(
        loginDto.password,
        usuario.password,
      );

      if (!encontrarClave) {
        throw new UnauthorizedException(mensajeError);
      }

      if (usuario.auth_two_factor) {
        return await this.usuarioService.newTwoFactorCode(usuario.email);
      }

      const data: AuthPayload = {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol.nombre,
        empresa_id: usuario.empresa_id,
        empresa_nombre: usuario.empresa.razon_social,
        foto_usuario: usuario.imagen_url
      };

      const token = await this.generateToken(data);

      // Establecer el token en una cookie segura
      res.cookie('jwt', token, {
        httpOnly: true, // Protege contra XSS
        /* secure: false,
        sameSite: 'lax', */ // Protege contra CSRF
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });

      return res.send({ 
        message: 'Inicio de sesión exitoso',
        data: data
      });

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Mantener el estado HTTP 401
      } 

      throw new InternalServerErrorException(`Ocurrio un error al hacer login: ${error}`);
    }
  }

  async newTwoFactorCodeAgain(email: string) {
    try {
      const usuario = await this.usuarioService.findOnebyEmail(email);
      if(!usuario) {
        throw new NotFoundException(`No se encontro un usuario con el email proporcionado.`);
      }
      return await this.usuarioService.newTwoFactorCode(usuario.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Error de estado HTTP 404
      }
      throw new InternalServerErrorException(`Ocurrio un error al solicitar nuevamente un codigo de autenticacion de dos pasos: ${error}`);
    }
  }

  async verifyTwoFactorAuth(twoFactorDto: TwoFactorAuth, res: Response) {
    try {
      const usuario = await this.usuarioService.findOnebyEmail(twoFactorDto.email);
      const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const tiempoLimite = format(usuario.two_factor_expired, 'yyyy-MM-dd HH:mm:ss')

      if (tiempoLimite < now ) {
        throw new UnauthorizedException(`El tiempo de espera finalizdo.`);
      }

      if (usuario.two_factor_code != twoFactorDto.codigo) {
        throw new UnauthorizedException(`El codigo de verificacion no es correcto.`);
      }

      const data: AuthPayload = {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol.nombre,
        empresa_id: usuario.empresa_id,
        empresa_nombre: usuario.empresa.razon_social,
        foto_usuario: usuario.imagen_url
      };
      
      const token = await this.generateToken(data);

      // Establecer el token en una cookie segura
      res.cookie('jwt', token, {
        httpOnly: true, // Protege contra XSS
        secure: true,
        sameSite: 'none', // Protege contra CSRF
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });

      return res.send({ 
        message: 'Inicio de sesión exitoso',
        data: data
      });

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Mantener el estado HTTP 401
      }
      throw new InternalServerErrorException(`Ocurrió un error en la verificación de two factor: ${error}`);
    }
  }

  async solicitarRecuperacionPassword(emailDto: EmailDto) {
    try {

      const usuario = await this.db
        .select()
        .from(UsuarioTable)
        .where(eq(UsuarioTable.email, emailDto.email))
        .limit(1);

      if (!usuario) {
        throw new BadRequestException(
          'No se encontró un usuario con ese correo.',
        );
      }

      const tokenRecuperacionPassword = uuidv4(); // Generar token único
      const linkRecuperacion = `${envs.baseFrontendUrl}/${envs.resetPassPath}${tokenRecuperacionPassword}`;

      // Guardar el token y su fecha de expiración
      await this.db
        .update(UsuarioTable)
        .set({
          token_verificacion_password: tokenRecuperacionPassword,
          token_expiry_password: new Date(Date.now() + 86400000)
        })
        .where(eq(UsuarioTable.email, emailDto.email))
        
      // Enviar correo con el enlace
      return await this.emailService.enviarRecuperadoPassword(
        emailDto.email,
        linkRecuperacion,
      );
      
    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error al intentar recuperar el passwod: ${error}`);
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {

      const { jwt } = req.cookies

      if(!jwt){
        throw new UnauthorizedException('No se encontro el token')
      }

      res.clearCookie("jwt")

      return res.send({ message: 'Cierre de sesión exitoso' });

    } catch (error) {
      throw new InternalServerErrorException(`Ocurrio un error al intentar cerrar la sesión: ${error}`);
    }
  }

}
