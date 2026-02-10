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
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ModalidadContratoEnumDto {
  CONVENIO_PRACTICAS = 'CONVENIO_PRACTICAS',
  PLAZO_FIJO = 'PLAZO_FIJO',
  INDETERMINADO = 'INDETERMINADO',
}

export enum MonedaEnumDto {
  PEN = 'PEN',
  USD = 'USD',
}

export enum EstadoContratoEnumDto {
  ACTIVO = 'ACTIVO',
  VENCIDO = 'VENCIDO',
  RENOVADO = 'RENOVADO',
  TERMINADO = 'TERMINADO',
}

export class CreateContratoDto {
  @ApiProperty({
    description: 'ID del empleado asociado al contrato',
    example: 12,
    type: Number,
  })
  @IsNotEmpty({ message: 'El empleado es obligatorio.' })
  @IsInt({ message: 'El empleado debe ser un número entero.' })
  @IsPositive({ message: 'El empleado debe ser mayor a cero.' })
  empleado_id: number;

  @ApiProperty({
    description: 'Modalidad del contrato',
    enum: ModalidadContratoEnumDto,
    example: ModalidadContratoEnumDto.PLAZO_FIJO,
  })
  @IsNotEmpty({ message: 'La modalidad del contrato es obligatoria.' })
  @IsEnum(ModalidadContratoEnumDto, {
    message: 'Modalidad de contrato inválida.',
  })
  modalidad: ModalidadContratoEnumDto;

  @ApiProperty({
    description: 'Fecha de inicio del contrato',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsDate({ message: 'El formato de la fecha de inicio no es válido.' })
  @IsNotEmpty({ message: 'La fecha de inicio es un campo requerido.' })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin del contrato (opcional)',
    example: '2024-12-31',
    type: String,
    format: 'date',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'El formato de la fecha de fin no es válido.' })
  fecha_fin?: Date;

  @ApiProperty({
    description: 'Ruta del archivo PDF del contrato',
    example: 'contrato_12_20240115_143022.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La ruta del archivo debe ser texto.' })
  archivo_pdf?: string;

  @ApiProperty({
    description: 'Sueldo bruto del contrato',
    example: 3500.5,
    type: Number,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'El sueldo bruto es obligatorio.' })
  @IsPositive({ message: 'El sueldo bruto debe ser mayor a cero.' })
  sueldo_bruto: number;

  @ApiProperty({
    description: 'Moneda del sueldo',
    enum: MonedaEnumDto,
    example: MonedaEnumDto.PEN,
  })
  @IsNotEmpty({ message: 'La moneda es obligatoria.' })
  @IsEnum(MonedaEnumDto, { message: 'Moneda inválida.' })
  moneda: MonedaEnumDto;

  @ApiProperty({
    description: 'Estado del contrato',
    enum: EstadoContratoEnumDto,
    example: EstadoContratoEnumDto.ACTIVO,
  })
  @IsNotEmpty({ message: 'El estado del contrato es obligatorio.' })
  @IsEnum(EstadoContratoEnumDto, { message: 'Estado del contrato inválido.' })
  estado: EstadoContratoEnumDto;

  @ApiProperty({
    description: 'Observaciones adicionales del contrato',
    example: 'Contrato con cláusulas especiales',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'Las observaciones deben ser texto.' })
  observaciones?: string;
}
