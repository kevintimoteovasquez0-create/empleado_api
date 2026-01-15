import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateEmpresaDto {

  @ApiProperty({
    example: 'Mi Empresa SAC',
    description: 'Razón social de la empresa. Máximo 50 caracteres.',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50, { message: 'La razon social no puede tener mas de 50 caracteres' })
  razon_social: string;

  @ApiProperty({
    example: '20123456789',
    description: 'RUC de la empresa. Debe contener exactamente 11 dígitos numéricos.',
    minLength: 11,
    maxLength: 11
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El ruc es obligatorio.' })
  @Matches(/^\d{11}$/, { message: 'El ruc solo puede contener 11 dígitos numéricos.' })
  ruc: string;

}