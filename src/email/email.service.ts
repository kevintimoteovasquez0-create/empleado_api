import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordDto } from './dto/password.dto';
import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import { envs } from 'src/config';

// Importes de Drizzle ORM
import { DrizzleService } from '../drizzle/drizzle.service';
import { UsuarioTable } from '../drizzle/schema/usuario';
import { eq } from 'drizzle-orm';

@Injectable()
export class EmailService {
  private emailAPI: TransactionalEmailsApi;
  private readonly db; // Variable privada para la base de datos

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.getDb(); // Inicializamos la DB

    this.emailAPI = new TransactionalEmailsApi();
    this.emailAPI.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      envs.brevoApiKey,
    ); // Configuramos la API key de Brevo
  }

  // Crear estructura de correo
  private createEmailData(
    to: string,
    subject: string,
    htmlContent: string,
  ): SendSmtpEmail {
    return {
      sender: { name: 'EMPRESOFT PERU S.A.C', email: `${envs.emailEmpresa}` },
      to: [{ email: to }],
      subject,
      htmlContent,
    } as SendSmtpEmail;
  }

  // Enviar correo de verificación de cuenta
  async sendVerificationEmail(email: string, verificationLink: string) {
    const subject = 'Verificación de correo electrónico';
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Correo</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">EMPRESOFT PERU S.A.C</h1>
                    <p style="margin: 10px 0 0 0; color: #e8e8ff; font-size: 14px; opacity: 0.9;">Soluciones empresariales</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hola</h2>
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6;">Gracias por registrarte. Para activar tu cuenta, verifica tu correo electrónico.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Verificar mi correo</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 30px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">Si no creaste esta cuenta, ignora este mensaje.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef; text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Empresoft Perú. Todos los derechos reservados.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

    try {
      await this.emailAPI.sendTransacEmail(
        this.createEmailData(email, subject, htmlContent),
      );
      return { message: 'Correo de verificación enviado exitosamente.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`No se pudo enviar el correo: ${message}`);
    }
  }

  // Enviar credenciales de usuario
  async sendUsuarioCredentials(
    email: string,
    password: string,
    nombreCompleto: string,
  ) {
    const subject = 'Credenciales de usuario - Aurora';
    const htmlContent = `
      <p>Estimado(a) ${nombreCompleto},</p>
      <p>Te hemos enviado tus credenciales para acceder a Aurora:</p>
      <ul>
        <li><strong>Correo electrónico:</strong> ${email}</li>
        <li><strong>Contraseña:</strong> ${password}</li>
      </ul>
      <p>Por seguridad, te recomendamos cambiar tu contraseña en tu primer ingreso.</p>
      <p>Atentamente,<br><strong>Empresoft Perú</strong></p>`;

    try {
      await this.emailAPI.sendTransacEmail(
        this.createEmailData(email, subject, htmlContent),
      );
      return { message: 'Correo de credenciales enviado exitosamente.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error al enviar credenciales: ${message}`);
    }
  }

  // Enviar correo de autenticación de dos pasos
  async sendTwoFactorAuthenticateEmail(email: string, codigo: number) {
    const codigoString = codigo.toString();
    const subject = 'Autenticación de dos pasos';
    const htmlContent = `
      <div style="font-family: Calibri, sans-serif; width: 50%; margin: auto; padding: 40px 20px; border-radius: 10px; text-align: center; background-color: #f9f9f9;">
        <p>Hola, este es tu código de autenticación de 2 pasos:</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
          ${codigoString
            .split('')
            .map(
              (num) =>
                `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; border-radius: 5px; background-color: #fff; border: 1px solid #ddd;">${num}</div>`,
            )
            .join('')}
        </div>
        <p style="color: red; font-weight: bold;">Válido por 5 minutos.</p>
        <p>Atentamente,<br><strong>Empresoft Perú</strong></p>
      </div>`;

    try {
      await this.emailAPI.sendTransacEmail(
        this.createEmailData(email, subject, htmlContent),
      );
      return { message: 'Correo de 2 pasos enviado correctamente.', email };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(`Error en 2FA: ${message}`);
    }
  }

  // Verificar cuenta en la base de datos
  async verificarCuenta(token: string) {
    try {
      const [usuario] = await this.db
        .select()
        .from(UsuarioTable)
        .where(eq(UsuarioTable.token_verificacion_email, token)); // Buscar usuario por token

      if (!usuario || usuario.verificado_email) {
        throw new BadRequestException('Usuario no encontrado o ya verificado.');
      }

      if (
        !usuario.token_expiry_email ||
        new Date(usuario.token_expiry_email) < new Date()
      ) {
        throw new BadRequestException('El token ha expirado.');
      }

      await this.db
        .update(UsuarioTable)
        .set({
          verificado_email: true,
          token_verificacion_email: null,
          token_expiry_email: null,
        })
        .where(eq(UsuarioTable.id, usuario.id)); // Actualizar estado de verificación

      return { message: 'Cuenta verificada exitosamente.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message =
        error instanceof Error ? error.message : 'Error de base de datos';
      throw new InternalServerErrorException(message);
    }
  }

  // Enviar correo de recuperación de contraseña
  async enviarRecuperadoPassword(email: string, recuperacionClaveLink: string) {
    const subject = 'Solicitud para recuperar contraseña';
    const htmlContent = `
      <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); font-family: sans-serif; max-width: 650px; margin: auto;">
        <div style="background: linear-gradient(135deg, #0074A8 0%, #13162A 100%); padding: 50px 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">EMPRESOFT PERU S.A.C</h1>
          <p>Recuperación de Contraseña</p>
        </div>
        <div style="padding: 50px;">
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${recuperacionClaveLink}" style="background: #0074A8; color: white; padding: 18px 50px; text-decoration: none; border-radius: 12px; font-weight: bold;">Restablecer Contraseña Ahora</a>
          </div>
          <p style="color: #999; font-size: 12px;">Este enlace expirará en 24 horas.</p>
        </div>
      </div>`;

    try {
      await this.emailAPI.sendTransacEmail(
        this.createEmailData(email, subject, htmlContent),
      );
      return { message: 'Correo de recuperación enviado exitosamente.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`No se pudo enviar el correo: ${message}`);
    }
  }

  // Restablecer contraseña en la DB
  async restablecerPassword(token: string, passwordDto: PasswordDto) {
    try {
      const [usuario] = await this.db
        .select()
        .from(UsuarioTable)
        .where(eq(UsuarioTable.token_verificacion_password, token)); // Buscar usuario por token de password

      if (!usuario) throw new BadRequestException('Token inválido.');

      if (
        !usuario.token_expiry_password ||
        new Date(usuario.token_expiry_password) < new Date()
      ) {
        throw new BadRequestException('El token ha expirado.');
      }

      const hashedPassword = await bcrypt.hash(passwordDto.password, 10); // Hashear contraseña

      await this.db
        .update(UsuarioTable)
        .set({
          password: hashedPassword,
          token_verificacion_password: null,
          token_expiry_password: null,
        })
        .where(eq(UsuarioTable.id, usuario.id)); // Actualizar contraseña

      return { message: 'Contraseña actualizada con éxito.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message =
        error instanceof Error ? error.message : 'Error al restablecer';
      throw new InternalServerErrorException(message);
    }
  }
}
