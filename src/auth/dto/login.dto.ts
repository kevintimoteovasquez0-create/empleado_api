import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {

  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico del usuario',
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
    example: 'P@ssw0rd123',
    description: 'Contraseña del usuario',
    maxLength: 60
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MaxLength(60, { message: 'La contraseña no puede superar los 60 caracteres.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;
}