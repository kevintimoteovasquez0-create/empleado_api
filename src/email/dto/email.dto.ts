import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class EmailDto {

  @ApiProperty({
    example: 'usuario@email.com',
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

}