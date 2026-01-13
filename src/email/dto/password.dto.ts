import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PasswordDto {

  @ApiProperty({
    example: 'Abc123$%',
    description: 'Contraseña del usuario. Debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.',
    minLength: 8,
    maxLength: 60
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(60, { message: 'La contraseña no puede superar los 60 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial.'
  })
  password: string;

}