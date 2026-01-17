import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { EmailDto } from 'src/email/dto/email.dto';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import type { AuthRequest } from './interfaces/auth-request';
import { VerifyTwoFactorDto } from './dto/verify_two_factor.dto';
import { VerifyRecoveryCodeDto } from './dto/verify_recovery_code.dto';
import { ConfirmTwoFactorDto } from './dto/confirm_two_factor.dto';
import { DisableTwoFactorDto } from './dto/disable_two_factor.dto';
import { RegenerateRecoveryCodesDto } from './dto/regenerate_recovery_codes.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuario autenticado',
    description: 'Devuelve la información del usuario actualmente autenticado',
  })
  @ApiResponse({ status: 200, description: 'Usuario autenticado obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getAuthenticatedUser(@Req() req: AuthRequest) {
    return this.authService.obtenerInfoUsuario(req.user.id)
  }

  @HttpCode(HttpStatus.OK)
  @HttpCode(200)
  @Post('/login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario con sus credenciales',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res)
  }

  @Post('/password/recover')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Recuperar contraseña',
    description: 'Envía un correo para la recuperación de contraseña',
  })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
  solicitarRecuperacionPassword(@Body() emailDto: EmailDto) {
    return this.authService.solicitarRecuperacionPassword(emailDto)
  }

  //2FA
  @Post('2fa/verify')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Verificar código 2FA en login',
    description: 'Verifica el código TOTP durante el proceso de inicio de sesión para usuarios con 2FA activo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código verificado correctamente - Sesión iniciada',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Código TOTP inválido o expirado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado'
  })
  async verify2FA(
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto,
    @Res() res: Response,
  ) {
    return this.authService.verifyTwoFactorTotp(verifyTwoFactorDto, res);
  }

  @Post('2fa/verify-recovery')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verificar código de recuperación',
    description: 'Inicia sesión usando un código de recuperación cuando no tienes acceso a tu aplicación de autenticación',
  })
  @ApiResponse({ status: 200, description: 'Código de recuperación válido, inicio de sesión completo' })
  @ApiResponse({ status: 401, description: 'Código de recuperación inválido o ya usado' })
  async verifyRecoveryCode(
    @Body() verifyRecoveryCodeDto: VerifyRecoveryCodeDto,
    @Res() res: Response,
  ) {
    return this.authService.verifyRecoveryCode(verifyRecoveryCodeDto, res);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Habilitar autenticación de dos factores',
    description: 'Genera un código QR y secret para configurar 2FA en la cuenta del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código QR y secret generados exitosamente',
    schema: {
      example: {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
        secret: 'JBSWY3DPEHPK3PXP'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado - Token inválido o ausente'
  })
  async enable2FA(@Req() req: AuthRequest) {
    return this.authService.enable2FA(req.user.id);
  }

  @Patch('2fa/confirm')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirmar habilitación de 2FA',
    description: 'Confirma y activa la autenticación de dos factores verificando el código TOTP'
  })
  @ApiResponse({ 
    status: 200, 
    description: '2FA activado exitosamente',
    schema: {
      example: {
        message: 'Autenticación de dos factores activada correctamente'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Código TOTP inválido'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado - Token inválido o ausente'
  })
  async confirm2FA(
    @Req() req: AuthRequest,
    @Body() confirmTwoFactorDto: ConfirmTwoFactorDto,
  ) {
    return this.authService.confirm2FA(req.user.id, confirmTwoFactorDto);
  }

  @Patch('2fa/regenerate-codes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Regenerar códigos de recuperación',
    description: 'Genera nuevos códigos de recuperación. Los anteriores quedan invalidados. Requiere código TOTP actual.',
  })
  @ApiResponse({ status: 200, description: 'Códigos regenerados exitosamente' })
  @ApiResponse({ status: 400, description: '2FA no está habilitado' })
  @ApiResponse({ status: 401, description: 'Código inválido' })
  async regenerateRecoveryCodes(
    @Req() req: AuthRequest,
    @Body() regenerateRecoveryCodesDto: RegenerateRecoveryCodesDto,
  ) {
    return this.authService.regenerateRecoveryCodes(req.user.id, regenerateRecoveryCodesDto);
  }

  @Patch('2fa/disable')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Deshabilitar autenticación de dos factores',
    description: 'Desactiva 2FA en la cuenta del usuario autenticado verificando el código TOTP actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: '2FA deshabilitado exitosamente',
    schema: {
      example: {
        message: 'Autenticación de dos factores deshabilitada correctamente'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Código TOTP inválido o 2FA no está habilitado'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado - Token inválido o ausente'
  })
  async disable2FA(
    @Req() req: AuthRequest,
    @Body() disableTwoFactorDto: DisableTwoFactorDto,
  ) {
    return this.authService.disable2FA(req.user.id, disableTwoFactorDto);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Cierra la sesión del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  logout(@Req() req: AuthRequest, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

}