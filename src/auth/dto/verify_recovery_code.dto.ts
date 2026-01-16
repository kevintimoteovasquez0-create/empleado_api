import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyRecoveryCodeDto {
  @ApiProperty({
    description: 'Token temporal recibido después del login inicial',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'El token temporal es requerido' })
  @IsString({ message: 'El token temporal debe ser una cadena de texto' })
  tempToken: string;

  @ApiProperty({
    description: 'Código de recuperación de 8 caracteres hexadecimales (A-F, 0-9)',
    example: 'A3F2B8C1',
    minLength: 8,
    maxLength: 8,
  })
  @IsNotEmpty({ message: 'El código de recuperación es requerido' })
  @IsString({ message: 'El código de recuperación debe ser una cadena de texto' })
  @Length(8, 8, { message: 'El código de recuperación debe tener exactamente 8 caracteres' })
  @Matches(/^[A-F0-9]{8}$/i, {
    message: 'El código de recuperación debe contener solo caracteres hexadecimales (A-F, 0-9)',
  })
  recoveryCode: string;
}