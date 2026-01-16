import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailDto } from 'src/email/dto/email.dto';
import { envs } from 'src/config';
import { Response } from 'express';
import { AuthPayload } from './interfaces/auth-payload';
import { AuthRequest } from './interfaces/auth-request';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { eq } from 'drizzle-orm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { TempPayload } from './interfaces/temp-payload';
import { VerifyTwoFactorDto } from './dto/verify_two_factor.dto';
import { VerifyRecoveryCodeDto } from './dto/verify_recovery_code.dto';
import { ConfirmTwoFactorDto } from './dto/confirm_two_factor.dto';
import { DisableTwoFactorDto } from './dto/disable_two_factor.dto';
import { RegenerateRecoveryCodesDto } from './dto/regenerate_recovery_codes.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly emailService: EmailService,
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {
  }

  private get db(){
    return this.drizzleService.getDb()
  }

  // Genera códigos de recuperación únicos (8 caracteres hexadecimales)
  private generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  //Hashea los códigos de recuperación
  private async hashRecoveryCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
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

      // Si el usuario tiene 2FA activado
      if (usuario.auth_two_factor && usuario.two_factor_secret) {
        // Generar token temporal de 5 minutos
        const tempPayload: TempPayload = {
          id: usuario.id,
          email: usuario.email,
          pendingTwoFactor: true,
        };
        const tempToken = await this.jwtService.signAsync(tempPayload, {
          expiresIn: '5m',
        });

        return res.send({
          requiresTwoFactor: true,
          tempToken: tempToken,
          message: 'Ingresa tu código de autenticación (Google Authenticator, Authy, etc.)',
        });
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

  async verifyTwoFactorTotp(verifyTwoFactorDto: VerifyTwoFactorDto, res: Response) {
    try {

      const { tempToken, codigo } = verifyTwoFactorDto;

      // Verificar el token temporal
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(tempToken);
      } catch (error) {
        throw new UnauthorizedException('Token temporal expirado o inválido. Intenta iniciar sesión nuevamente.');
      }

      if (!payload.pendingTwoFactor) {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar usuario
      const usuario = await this.usuarioService.findUniqueUsuario(payload.id, true);

      if (!usuario || !usuario.auth_two_factor || !usuario.two_factor_secret) {
        throw new UnauthorizedException('2FA no está habilitado para este usuario');
      }

      // Verificar el código TOTP
      const isValid = speakeasy.totp.verify({
        secret: usuario.two_factor_secret,
        encoding: 'base32',
        token: codigo,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException('Código de verificacion incorrecto');
      }

      // Código correcto, generar token completo
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

      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.send({ 
        message: 'Inicio de sesion exitoso',
        data: data
      });

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Ocurrió un error en la verificacion 2FA: ${error}`);
    }
  }

  async verifyRecoveryCode(verifyRecoveryCodeDto: VerifyRecoveryCodeDto, res: Response) {
    try {

      const { tempToken, recoveryCode } = verifyRecoveryCodeDto;

      // Verificar el token temporal
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(tempToken);
      } catch (error) {
        throw new UnauthorizedException('Token temporal expirado o inválido. Intenta iniciar sesion nuevamente.');
      }

      if (!payload.pendingTwoFactor) {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar usuario
      const usuario = await this.usuarioService.findUniqueUsuario(payload.id, true);

      if (!usuario || !usuario.auth_two_factor) {
        throw new UnauthorizedException('2FA no esta habilitado para este usuario');
      }

      if (!usuario.recovery_codes) {
        throw new BadRequestException('No hay codigos de recuperacion disponibles');
      }

      // Parsear los códigos hasheados
      const hashedCodes: string[] = JSON.parse(usuario.recovery_codes);
      let codeUsed = false;
      let remainingCodes: string[] = [];

      // Verificar si el código de recuperación es válido
      for (const hashedCode of hashedCodes) {
        const isValid = await bcrypt.compare(recoveryCode.toUpperCase(), hashedCode);
        if (isValid && !codeUsed) {
          codeUsed = true;
        } else {
          remainingCodes.push(hashedCode);
        }
      }

      if (!codeUsed) {
        throw new UnauthorizedException('Codigo de recuperación invalido o ya usado');
      }

      // Actualizar códigos restantes
      await this.db
        .update(UsuarioTable)
        .set({ recovery_codes: JSON.stringify(remainingCodes) })
        .where(eq(UsuarioTable.id, usuario.id));

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

      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.send({ 
        message: 'Inicio de sesión exitoso con código de recuperación',
        data: data,
        warning: remainingCodes.length === 0 
          ? 'Has usado tu ultimo codigo de recuperacion. Por favor, genera nuevos codigos desde tu perfil.'
          : `Te quedan ${remainingCodes.length} codigo(s) de recuperación.`
      });

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Ocurrió un error al verificar el código de recuperación: ${error}`);
    }
  }

  async enable2FA(usuarioId: number) {
    try {
      const usuario = await this.usuarioService.findUniqueUsuario(usuarioId, true);

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (usuario.auth_two_factor) {
        throw new BadRequestException('2FA ya está habilitado para este usuario');
      }

      // Generar secreto único
      const secret = speakeasy.generateSecret({
        name: `${envs.appName || 'empresoftperusac'} (${usuario.email})`,
        length: 32,
      });

      // Guardar el secreto
      await this.db
        .update(UsuarioTable)
        .set({ two_factor_secret: secret.base32 })
        .where(eq(UsuarioTable.id, usuarioId));

      // Generar código QR
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, Microsoft Authenticator)',
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al habilitar 2FA: ${error}`);
    }
  }

  async confirm2FA(usuarioId: number, confirmTwoFactorDto: ConfirmTwoFactorDto) {
    try {

      const { codigo } = confirmTwoFactorDto;

      const usuario = await this.usuarioService.findUniqueUsuario(usuarioId, false);

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!usuario.two_factor_secret) {
        throw new BadRequestException('Primero debes generar el código QR.');
      }

      if (usuario.auth_two_factor) {
        throw new BadRequestException('2FA ya está activo');
      }

      // Verificar el código
      const isValid = speakeasy.totp.verify({
        secret: usuario.two_factor_secret,
        encoding: 'base32',
        token: codigo,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException('Código inválido. Verifica que hayas escaneado correctamente el QR.');
      }

      // Generar códigos de recuperación
      const recoveryCodes = this.generateRecoveryCodes(10);
      const hashedCodes = await this.hashRecoveryCodes(recoveryCodes);

      // ACTIVAR 2FA
      await this.db
        .update(UsuarioTable)
        .set({ 
          auth_two_factor: true,
          recovery_codes: JSON.stringify(hashedCodes)
        })
        .where(eq(UsuarioTable.id, usuarioId));

      return {
        success: true,
        message: '2FA activado exitosamente. Desde ahora necesitarás tu código de autenticación al iniciar sesión.',
        recoveryCodes: recoveryCodes,
        warning: 'IMPORTANTE: Guarda estos códigos de recuperación en un lugar seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación. Cada código solo puede usarse una vez.',
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al confirmar 2FA: ${error}`);
    }
  }

  async regenerateRecoveryCodes(usuarioId: number, regenerateRecoveryCodesDto: RegenerateRecoveryCodesDto) {
    try {

      const { codigo } = regenerateRecoveryCodesDto;

      const usuario = await this.usuarioService.findUniqueUsuario(usuarioId, false);

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!usuario.auth_two_factor || !usuario.two_factor_secret) {
        throw new BadRequestException('2FA no está habilitado');
      }

      // Verificar código TOTP antes de regenerar
      const isValid = speakeasy.totp.verify({
        secret: usuario.two_factor_secret,
        encoding: 'base32',
        token: codigo,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException('Código de verificación incorrecto');
      }

      // Generar nuevos códigos de recuperación
      const recoveryCodes = this.generateRecoveryCodes(10);
      const hashedCodes = await this.hashRecoveryCodes(recoveryCodes);

      // Actualizar códigos en la BD
      await this.db
        .update(UsuarioTable)
        .set({ 
          recovery_codes: JSON.stringify(hashedCodes) 
        })
        .where(eq(UsuarioTable.id, usuarioId));

      return {
        success: true,
        message: 'Códigos de recuperación regenerados exitosamente',
        recoveryCodes: recoveryCodes,
        warning: 'Los códigos anteriores han sido invalidados. Guarda estos nuevos códigos en un lugar seguro.',
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al regenerar códigos de recuperación: ${error}`);
    }
  }

  async disable2FA(usuarioId: number, disableTwoFactorDto: DisableTwoFactorDto) {
    try {

      const { codigo } = disableTwoFactorDto;

      const usuario = await this.usuarioService.findUniqueUsuario(usuarioId, false);

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!usuario.auth_two_factor) {
        throw new BadRequestException('2FA no está habilitado');
      }

      // Verificar código antes de deshabilitar
      const isValid = speakeasy.totp.verify({
        secret: usuario.two_factor_secret,
        encoding: 'base32',
        token: codigo,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException('Código inválido');
      }

      // Deshabilitar 2FA
      await this.db
        .update(UsuarioTable)
        .set({ 
          auth_two_factor: false,
          two_factor_secret: null,
          recovery_codes: null,
        })
        .where(eq(UsuarioTable.id, usuarioId));

      return {
        success: true,
        message: '2FA deshabilitado exitosamente',
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al deshabilitar 2FA: ${error}`);
    }
  }

  async solicitarRecuperacionPassword(emailDto: EmailDto) {
    try {

      const [usuario] = await this.db
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
