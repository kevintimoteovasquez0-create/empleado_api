import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class TwoFactorAuth {

  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico del usuario que realiza la autenticación en dos pasos',
    maxLength: 60
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value
  )
  @IsEmail({}, { message: 'El email no es válido.' })
  @MaxLength(60, { message: 'El email no puede superar los 60 caracteres.' })
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  email: string;

  @ApiProperty({
    example: 123456,
    description: 'Código de verificación enviado al correo del usuario (2FA)'
  })
  @IsInt({ message: 'El código solo debe contener números.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  codigo: number;
}
