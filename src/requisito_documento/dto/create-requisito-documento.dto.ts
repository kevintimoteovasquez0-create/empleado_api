import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength
} from 'class-validator';

export enum AplicaParaEnumDto {
    PLANILLA = 'PLANILLA',
    PRACTICANTE = 'PRACTICANTE',
    AMBOS = 'AMBOS',
}

export class CreateRequisitoDocumentoDto {
    @ApiProperty({
        description: 'Nombre del requisito documento',
        example: 'DNI Ambas Caras',
        type: String,
        maxLength: 100,
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'El nombre del requisito es obligatorio.' })
    @IsString({ message: 'El nombre debe ser texto.' })
    @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
    nombre: string;

    @ApiPropertyOptional({
        description: 'Descripción del requisito documento',
        example: 'Documento Nacional de Identidad por ambas caras',
        type: String,
        maxLength: 255,
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'la descripcion es obligatoria' })
    @IsString({ message: 'La descripción debe ser texto.' })
    @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres.' })
    descripcion: string;

    @ApiProperty({
        description: 'Indica si el requisito es obligatorio',
        example: true,
        type: Boolean,
    })
    @IsNotEmpty({ message: 'El campo es_obligatorio es requerido.' })
    @IsBoolean({ message: 'El campo es_obligatorio debe ser un valor booleano.' })
    es_obligatorio: boolean;

    @ApiProperty({
        description: 'A quién aplica el requisito documento',
        enum: AplicaParaEnumDto,
        example: AplicaParaEnumDto.AMBOS,
    })
    @IsNotEmpty({ message: 'El campo aplica_para es obligatorio.' })
    @IsEnum(AplicaParaEnumDto, {
        message: 'El valor de aplica_para debe ser: PLANILLA, PRACTICANTE o AMBOS.',
    })
    aplica_para: AplicaParaEnumDto;

    @ApiProperty({
        description: 'Orden de visualización del requisito',
        example: 1,
        type: Number,
    })
    @IsNotEmpty({ message: 'El orden de visualización es obligatorio.' })
    @IsInt({ message: 'El orden de visualización debe ser un número entero.' })
    @IsPositive({ message: 'El orden de visualización debe ser mayor que cero.' })
    orden_visualizacion: number;
}