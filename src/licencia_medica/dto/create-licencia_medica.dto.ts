import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoLicenciaEnumDto {
  DESCANSO_MEDICO = 'DESCANSO_MEDICO',
  LICENCIA_MATERNIDAD = 'LICENCIA_MATERNIDAD',
  LICENCIA_PATERNIDAD = 'LICENCIA_PATERNIDAD',
}

export enum EstadoLicenciaEnumDto {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export class CreateLicenciaMedicaDto {
  @ApiProperty({
    description: 'ID del empleado asociado a la licencia',
    example: 12,
    type: Number,
  })
  @IsNotEmpty({ message: 'El empleado es obligatorio.' })
  @IsInt({ message: 'El empleado debe ser un número entero.' })
  @IsPositive({ message: 'El empleado debe ser mayor a cero.' })
  empleado_id: number;

  @ApiProperty({
    description: 'Tipo de licencia médica',
    enum: TipoLicenciaEnumDto,
    example: TipoLicenciaEnumDto.DESCANSO_MEDICO,
  })
  @IsNotEmpty({ message: 'El tipo de licencia es obligatorio.' })
  @IsEnum(TipoLicenciaEnumDto, { message: 'Tipo de licencia inválido.' })
  tipo: TipoLicenciaEnumDto;

  @ApiProperty({
    description: 'Diagnóstico según código CIE10',
    example: 'J45.0',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El diagnóstico CIE10 debe ser texto.' })
  @MaxLength(100, {
    message: 'El diagnóstico CIE10 no puede superar 100 caracteres.',
  })
  @Matches(/^[A-Z]\d{2}(\.\d{1,2})?$/, {
    message: 'El formato CIE10 no es válido. Ejemplo: A00, J45.0',
  })
  diagnostico_cie10?: string;

  @ApiProperty({
    description: 'Nombre del doctor tratante',
    example: 'Dr. Juan Pérez García',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del doctor debe ser texto.' })
  @MaxLength(150, {
    message: 'El nombre del doctor no puede superar 150 caracteres.',
  })
  doctor_tratante?: string;

  @ApiProperty({
    description: 'Número de colegiado médico del profesional',
    example: '12345',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El CMP debe ser texto.' })
  @MaxLength(20, { message: 'El CMP no puede superar 20 caracteres.' })
  cmp?: string;

  @ApiProperty({
    description: 'Ruta del archivo PDF de sustento',
    example: 'licencia_12_20240115_143022.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La ruta del archivo debe ser texto.' })
  archivo_sustento_pdf?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la licencia',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsDate({ message: 'El formato de la fecha de inicio no es válido.' })
  @IsNotEmpty({ message: 'La fecha de inicio es un campo requerido.' })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Número de días de descanso',
    example: 7,
    type: Number,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Los días de descanso son obligatorios.' })
  @IsInt({ message: 'Los días de descanso deben ser un número entero.' })
  @IsPositive({ message: 'Los días de descanso deben ser mayor a cero.' })
  dias_descanso: number;

  @ApiProperty({
    description: 'Estado de la licencia',
    enum: EstadoLicenciaEnumDto,
    example: EstadoLicenciaEnumDto.PENDIENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoLicenciaEnumDto, { message: 'Estado de licencia inválido.' })
  estado?: EstadoLicenciaEnumDto;

  @ApiProperty({
    description: 'ID del usuario que revisó la licencia',
    example: 5,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El revisor debe ser un número entero.' })
  @IsPositive({ message: 'El revisor debe ser mayor a cero.' })
  revisado_por?: number;
}
