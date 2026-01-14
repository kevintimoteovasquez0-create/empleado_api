import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import * as bcrypt from 'bcryptjs';
import { PasswordDto } from './dto/password.dto';
import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { envs } from 'src/config';
import { UsuarioTable } from 'src/drizzle/schema/usuario';
import { eq } from 'drizzle-orm';

@Injectable()
export class EmailService {
  private emailAPI: TransactionalEmailsApi;
  private readonly db;

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = drizzleService.getDb();
    
    // Inicializar Brevo
    this.emailAPI = new TransactionalEmailsApi();
    this.emailAPI.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      envs.brevoApiKey
    );
  }

  private createEmailData(to: string, subject: string, htmlContent: string): SendSmtpEmail {
    return {
      sender: { name: 'EMPRESOFT PERU S.A.C', email: `${envs.emailEmpresa}` },
      to: [{ email: to }],
      subject,
      htmlContent,
    };
  }

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
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                      EMPRESOFT PERU S.A.C
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #e8e8ff; font-size: 14px; opacity: 0.9;">
                      Soluciones empresariales
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                      ¡Hola! 👋
                    </h2>
                    
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                      Gracias por registrarte en <strong>EMPRESOFT PERU S.A.C</strong>. Para completar tu registro y activar tu cuenta, necesitamos que verifiques tu correo electrónico.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                            Verificar mi correo
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                            <strong>⏰ Importante:</strong> Este enlace expirará en <strong>24 horas</strong>. Si no verificas tu correo dentro de este período, deberás solicitar un nuevo enlace de verificación.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                      Si no creaste una cuenta con nosotros, puedes ignorar este correo de forma segura.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px; line-height: 1.5;">
                      Atentamente,<br>
                      <strong style="color: #333333;">El equipo de Empresoft Perú</strong>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                      © ${new Date().getFullYear()} Empresoft Perú. Todos los derechos reservados.<br>
                      Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                  </td>
                </tr>
                
              </table>
              
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td style="padding: 0 20px;">
                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                      ¿Problemas con el botón? Copia y pega este enlace en tu navegador:<br>
                      <a href="${verificationLink}" style="color: #667eea; word-break: break-all;">${verificationLink}</a>
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const emailData = this.createEmailData(email, subject, htmlContent);

    try {
      await this.emailAPI.sendTransacEmail(emailData);
      return { message: 'Correo de verificación enviado exitosamente.' };
    } catch (error) {
      throw new BadRequestException(
        `No se pudo enviar el correo de verificación: ${error.message}`,
      );
    }
  }

  async sendUsuarioCredentials(email: string, password: string, nombreCompleto: string) {
    const subject = 'Credenciales de usuario - Aurora';
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credenciales de Usuario</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                      EMPRESOFT PERU S.A.C
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #e8e8ff; font-size: 14px;">
                      Sistema Aurora
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                      Estimado(a) ${nombreCompleto},
                    </h2>
                    
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                      Te hemos creado una cuenta en nuestro sistema Aurora. A continuación, encontrarás tus credenciales de acceso:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 15px 0; color: #333333; font-size: 15px;">
                            <strong style="color: #667eea;">Correo electrónico:</strong><br>
                            <span style="color: #555555;">${email}</span>
                          </p>
                          <p style="margin: 0; color: #333333; font-size: 15px;">
                            <strong style="color: #667eea;">Contraseña:</strong><br>
                            <span style="color: #555555; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; display: inline-block;">${password}</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                            <strong>🔒 Recomendación de seguridad:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña en tu primer ingreso al sistema.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                      Atentamente,<br>
                      <strong style="color: #333333;">Empresoft Perú</strong>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailData = this.createEmailData(email, subject, htmlContent);

    try {
      await this.emailAPI.sendTransacEmail(emailData);
      return { message: 'Correo de credenciales enviado exitosamente.' };
    } catch (error) {
      throw new BadRequestException(
        `No se pudo enviar el correo de credenciales: ${error.message}`,
      );
    }
  }

  async sendTwoFactorAuthenticateEmail(email: string, codigo: number) {
    const codigoString = codigo.toString();
      
    const subject = 'Autenticación de dos pasos';
    const htmlContent = `
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de correo electrónico</title>
      </head>
      <body>
          <style>
              body {
                  font-family: Calibri, sans-serif;
              }
              .container {
                  width: 50%;
                  margin: auto;
                  padding: 40px 20px;
                  border-radius: 10px;
                  text-align: center;
                  background-color: #f9f9f9;
              }
              .code-container {
                  display: flex;
                  justify-content: center;
                  gap: 10px;
                  margin: 20px 0;
              }
              .code-box {
                  width: 50px;
                  height: 50px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  font-weight: bold;
                  border-radius: 5px;
                  background-color: #fff;
              }
              .warning {
                  color: red;
                  font-weight: bold;
              }
          </style>
          <div class="container">
              <p>Hola,</p>
              <p>Este es tu autenticador de 2 pasos:</p>
              <div class="code-container">
                  ${codigoString
                    .split('')
                    .map((num) => `<div class="code-box">${num}</div>`)
                    .join('')}
              </div>
              <p class="warning">⚠️ Este código solo tiene una duración de 5 minutos. Pasado ese tiempo, deberás solicitarlo nuevamente.</p>
              <p>Si no iniciaste sesión, es probable que tu cuenta ya no esté segura.</p>
              <p>Atentamente,</p>
              <p><strong>Empresoft Perú</strong></p>
          </div>
      </body>
      </html>
    `;

    const emailData = this.createEmailData(email, subject, htmlContent);

    try {
      await this.emailAPI.sendTransacEmail(emailData);
      return {
        message: 'Correo de 2 pasos enviado correctamente.',
        email: email,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrio un error al enviar el correo de autenticacion de 2 pasos: ${error}`,
      );
    }
  }

  async verificarCuenta(token: string) {
    try {
      const usuarioEncontrado = await this.db
        .select()
        .from(UsuarioTable)
        .where(eq(UsuarioTable.token_verificacion_email, token))
        .limit(1);

      if (!usuarioEncontrado || usuarioEncontrado.verificado_email === true) {
        throw new BadRequestException('Usuario no encontrado o ya verificado.');
      }

      if (usuarioEncontrado.token_expiry_email < new Date()) {
        throw new BadRequestException('El token ha expirado, solicite uno nuevo visitando su perfil de usuario.');
      }

      await this.db
        .update(UsuarioTable)
        .set({
          verificado_email: true,
          token_verificacion_email: null,
          token_expiry_email: null,
        })
        .where(eq(UsuarioTable.id, usuarioEncontrado[0].id));

      return { message: 'Cuenta verificada exitosamente.' };

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async enviarRecuperadoPassword(email: string, recuperacionClaveLink: string) {
    const subject = 'Solicitud para recuperar contraseña';
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 60px 20px;">
          <tr>
            <td align="center">
              <table width="650" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0074A8 0%, #13162A 100%); padding: 50px 40px; text-align: center; position: relative;">
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3);">
                            <span style="font-size: 32px; color: #ffffff;">🏢</span>
                          </div>
                          
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                            EMPRESOFT PERU S.A.C
                          </h1>
                          <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 400; letter-spacing: 0.5px;">
                            Innovación y Tecnología Empresarial
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 55px 50px;">
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #e6f4f9 0%, #cce8f4 100%); border-radius: 20px; display: inline-block; line-height: 80px; text-align: center; box-shadow: 0 8px 20px rgba(0, 116, 168, 0.15);">
                        <span style="font-size: 40px; vertical-align: middle;">🔐</span>
                      </div>
                    </div>
                    
                    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 28px; font-weight: 700; text-align: center; letter-spacing: -0.5px;">
                      Recuperación de Contraseña
                    </h2>
                    
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.7; text-align: center;">
                      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 12px; padding: 30px; margin-bottom: 35px; border: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; line-height: 1.7;">
                        Para crear una nueva contraseña segura y recuperar el acceso a tu cuenta, haz clic en el siguiente botón:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${recuperacionClaveLink}" style="display: inline-block; background: linear-gradient(135deg, #0074A8 0%, #13162A 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 30px rgba(0, 116, 168, 0.4); border: 2px solid transparent; transition: all 0.3s ease;">
                              <span style="letter-spacing: 0.3px;">✓ Restablecer Contraseña Ahora</span>
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6;">
                        O copia y pega esta URL en tu navegador:<br>
                        <a href="${recuperacionClaveLink}" style="color: #0074A8; text-decoration: none; word-break: break-all; font-size: 12px;">${recuperacionClaveLink}</a>
                      </p>
                    </div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 5px solid #f59e0b; border-radius: 10px; overflow: hidden;">
                      <tr>
                        <td style="padding: 25px 30px; text-align: center;">
                          <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.2); border-radius: 10px; display: inline-block; line-height: 40px; text-align: center; margin-bottom: 15px;">
                            <span style="font-size: 22px; vertical-align: middle;">⏰</span>
                          </div>
                          <p style="margin: 0 0 6px 0; color: #92400e; font-size: 15px; font-weight: 700; text-align: center;">
                            Enlace de Tiempo Limitado
                          </p>
                          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; text-align: center;">
                            Este enlace de recuperación expirará en <strong>24 horas</strong>. Después de este tiempo, necesitarás solicitar un nuevo enlace desde la pantalla de inicio de sesión.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 5px solid #ef4444; border-radius: 10px; overflow: hidden;">
                      <tr>
                        <td style="padding: 25px 30px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; background: rgba(239, 68, 68, 0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                                  <span style="font-size: 22px;">🛡️</span>
                                </div>
                                <p style="margin: 0 0 6px 0; color: #991b1b; font-size: 15px; font-weight: 700; text-align: center;">
                                  Alerta de Seguridad
                                </p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6; text-align: center;">
                                  Si <strong>NO solicitaste</strong> este cambio, ignora este correo y tu contraseña permanecerá sin cambios. Te recomendamos revisar la actividad reciente de tu cuenta y habilitar la autenticación de dos factores.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="margin: 40px 0; height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent);"></div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; padding: 25px; border: 1px solid #bbf7d0;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 700;">
                            💡 Consejos para una contraseña segura:
                          </p>
                          <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.8;">
                            <li>Usa al menos 12 caracteres</li>
                            <li>Combina mayúsculas, minúsculas, números y símbolos</li>
                            <li>Evita información personal o palabras comunes</li>
                            <li>No reutilices contraseñas de otras cuentas</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <tr>
                  <td style="background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%); padding: 40px 50px; border-top: 1px solid #e4e4e7;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                            Con dedicación,
                          </p>
                          <p style="margin: 0 0 20px 0; color: #27272a; font-size: 15px; font-weight: 700;">
                            El Equipo de EMPRESOFT PERU S.A.C
                          </p>
                          
                          <div style="margin: 25px 0; height: 1px; background: linear-gradient(90deg, transparent, #e4e4e7, transparent);"></div>
                          
                          <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.7;">
                            © ${new Date().getFullYear()} EMPRESOFT PERU S.A.C. Todos los derechos reservados.<br>
                            Este es un correo electrónico automático. Por favor, no respondas a este mensaje.
                          </p>
                          
                          <p style="margin: 15px 0 0 0; color: #d4d4d8; font-size: 11px;">
                            🔒 Tus datos están protegidos y encriptados
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const emailData = this.createEmailData(email, subject, htmlContent);

    try {
      await this.emailAPI.sendTransacEmail(emailData);
      return {
        message: 'Correo de recuperación de contraseña enviado exitosamente.',
      };
    } catch (error) {
     throw new BadRequestException(
        `No se pudo enviar el correo de recuperación de contraseña, ${error}`,
      );
    }
  }

  async restablecerPassword(token: string, passwordDto: PasswordDto) {
    try {
      const usuarioEncontrado = await this.db
        .select()
        .from(UsuarioTable)
        .where(eq(UsuarioTable.token_verificacion_password, token))
        .limit(1);

     if (!usuarioEncontrado || usuarioEncontrado.token_verificacion_password !== token) {
        throw new BadRequestException(
          'Token inválido o usuario no encontrado.',
        );
      }

      // Verificar si el token ha expirado
      if (
        usuarioEncontrado.token_expiry_password &&
        usuarioEncontrado.token_expiry_password < new Date()
      ) {
        throw new BadRequestException(
          'El token ha expirado, vuelva a solicitar nuevamente el restablecimiento de su contraseña.',
        );
      }

      const hashedPassword = await bcrypt.hash(passwordDto.password, 10);

      await this.db
        .update(UsuarioTable)
        .set({
          password: hashedPassword,
          token_verificacion_password: null,
          token_expiry_password: null,
        })
        .where(eq(UsuarioTable.id, usuarioEncontrado[0].id));

      return { message: 'Contraseña actualizada con éxito.' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}