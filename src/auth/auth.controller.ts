import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { EmailDto } from 'src/email/dto/email.dto';
import { TwoFactorAuth } from './dto/two_factor_auth.dto';
import { NewTwoFactorCode } from './dto/new_two_facto_code.dto';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import type { AuthRequest } from './interfaces/auth-request';

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
  @ApiOperation({
    summary: 'Recuperar contraseña',
    description: 'Envía un correo para la recuperación de contraseña',
  })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
  solicitarRecuperacionPassword(@Body() emailDto: EmailDto) {
    return this.authService.solicitarRecuperacionPassword(emailDto)
  }

  @Post('/two-factor/verify')
  @ApiOperation({
    summary: 'Verificar código de doble factor',
    description: 'Verifica el código de autenticación de dos factores',
  })
  @ApiResponse({ status: 200, description: 'Código 2FA verificado correctamente' })
  @ApiResponse({ status: 401, description: 'Código inválido o expirado' })
  verifyTwoFactor(@Body() twoFactorDto: TwoFactorAuth, @Res() res: Response) {
    return this.authService.verifyTwoFactorAuth(twoFactorDto, res);
  }

  @Post('/two-factor/code')
  @ApiOperation({
    summary: 'Generar nuevo código 2FA',
    description: 'Genera y envía un nuevo código de autenticación de dos factores',
  })
  @ApiResponse({ status: 200, description: 'Nuevo código 2FA enviado' })
  newCodeTwoFactor(@Body() twoFactorDto: NewTwoFactorCode) {
    return this.authService.newTwoFactorCodeAgain(twoFactorDto.email);
  }

  @Post('/logout')
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