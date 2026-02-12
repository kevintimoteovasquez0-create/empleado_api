import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export enum TipoArchivoEnumDto {
  PDF = 'pdf',
  IMG = 'img',
}

export enum EstadoDocumentoEnumDto {
  PENDIENTE = 'PENDIENTE',
  COMPLETO = 'COMPLETO',
  OBSERVADO = 'OBSERVADO',
}

export class CreateDocumentoEmpleadoDto {
  @ApiProperty({
    description: 'ID del empleado',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del empleado es obligatorio.' })
  @IsInt({ message: 'El ID del empleado debe ser un número entero.' })
  @IsPositive({ message: 'El ID del empleado debe ser mayor que cero.' })
  empleado_id: number;

  @ApiProperty({
    description: 'ID del requisito de documento',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del requisito es obligatorio.' })
  @IsInt({ message: 'El ID del requisito debe ser un número entero.' })
  @IsPositive({ message: 'El ID del requisito debe ser mayor que cero.' })
  requisito_id: number;

  @ApiProperty({
    description: 'Ruta del archivo en el servidor (máx 2MB)',
    example: '/uploads/documentos/empleado_1_dni.pdf',
    type: String,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La ruta del archivo es obligatoria.' })
  @IsString({ message: 'La ruta del archivo debe ser texto.' })
  @MaxLength(500, {
    message: 'La ruta del archivo no puede superar los 500 caracteres.',
  })
  archivo_pdf: string;

  @ApiProperty({
    description: 'Tipo de archivo subido',
    enum: TipoArchivoEnumDto,
    example: TipoArchivoEnumDto.PDF,
  })
  @IsNotEmpty({ message: 'El tipo de archivo es obligatorio.' })
  @IsEnum(TipoArchivoEnumDto, {
    message: 'El tipo de archivo debe ser: pdf o img.',
  })
  tipo_archivo: TipoArchivoEnumDto;

  @ApiPropertyOptional({
    description: 'Estado del documento',
    enum: EstadoDocumentoEnumDto,
    example: EstadoDocumentoEnumDto.PENDIENTE,
    default: EstadoDocumentoEnumDto.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoDocumentoEnumDto, {
    message: 'El estado debe ser: PENDIENTE, COMPLETO o OBSERVADO.',
  })
  estado?: EstadoDocumentoEnumDto;

  @ApiPropertyOptional({
    description: 'Texto de observación sobre el documento',
    example: 'Documento borroso, debe subir una versión más clara',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La observación debe ser texto.' })
  @MaxLength(500, {
    message: 'La observación no puede superar los 500 caracteres.',
  })
  observacion_texto?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que revisó el documento',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del revisor debe ser un número entero.' })
  @IsPositive({ message: 'El ID del revisor debe ser mayor que cero.' })
  revisado_por?: number;
}
