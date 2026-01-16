import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'Token temporal recibido después del login inicial',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'El token temporal es requerido' })
  @IsString({ message: 'El token temporal debe ser una cadena de texto' })
  tempToken: string;

  @ApiProperty({
    description: 'Código de 6 dígitos generado por Google Authenticator',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  codigo: string;
}