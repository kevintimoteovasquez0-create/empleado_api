import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EmailService } from "./email.service";
import { PasswordDto } from "./dto/password.dto";

@ApiTags('Email')
@Controller('email')
export class EmailController {

  constructor(private readonly emailService: EmailService){}

  @Put('/verificar/:token')
  @ApiOperation({
    summary: 'Verificar cuenta',
    description: 'Verifica la cuenta del usuario mediante un token enviado por correo electrónico',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de verificación de cuenta',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta verificada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  verificarCuenta(@Param('token') token: string) {
    return this.emailService.verificarCuenta(token);
  }

  @Put('/password/reset/:token')
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña del usuario usando un token de recuperación',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de recuperación de contraseña',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  restablecerPassword(
    @Param('token') token: string,
    @Body() passwordDto: PasswordDto
  ){
    return this.emailService.restablecerPassword(token, passwordDto)
  }
}