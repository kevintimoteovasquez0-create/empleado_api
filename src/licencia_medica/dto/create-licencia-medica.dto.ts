import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export enum TipoLicenciaEnum {
    DESCANSO_MEDICO = 'descanso_medico',
    LICENCIA_MATERNIDAD = 'licencia_maternidad',
    LICENCIA_PATERNIDAD = 'licencia_paternidad',
}

export enum EstadoLicenciaEnum {
    PENDIENTE = 'pendiente',
    APROBADO = 'aprobado',
    RECHAZADO = 'rechazado',
}

export class CreateLicenciaMedicaDto {

    @ApiProperty({
        description: 'ID del empleado al que pertenece la licencia médica',
        example: 1,
        type: Number,
    })
    @IsNotEmpty({ message: 'El empleado es obligatorio.' })
    @IsInt({ message: 'El empleado debe ser un número entero.' })
    @IsPositive({ message: 'El empleado debe ser mayor a cero.' })
    empleado_id: number;

    @ApiProperty({
        description: 'Tipo de licencia médica',
        enum: TipoLicenciaEnum,
        example: TipoLicenciaEnum.DESCANSO_MEDICO,
    })
    @IsNotEmpty({ message: 'El tipo de licencia es obligatorio.' })
    @IsEnum(TipoLicenciaEnum, { message: 'Tipo de licencia inválido.' })
    tipo: TipoLicenciaEnum;

    @ApiProperty({
        description: 'Código CIE-10 del diagnóstico',
        example: 'K30',
        maxLength: 100,
    })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El diagnóstico CIE-10 es obligatorio.' })
    @IsString({ message: 'El diagnóstico debe ser texto.' })
    @MaxLength(100, { message: 'El diagnóstico no puede superar 100 caracteres.' })
    diagnostico_cie10: string;

    @ApiProperty({
        description: 'Nombre completo del doctor tratante',
        example: 'Dr. Juan Pérez',
        maxLength: 150,
    })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El doctor tratante es obligatorio.' })
    @IsString({ message: 'El doctor tratante debe ser texto.' })
    @MaxLength(150, { message: 'El doctor tratante no puede superar 150 caracteres.' })
    doctor_tratante: string;

    @ApiProperty({
        description: 'Código CMP del médico (Colegio Médico del Perú)',
        example: '123456',
        maxLength: 20,
    })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El CMP es obligatorio.' })
    @IsString({ message: 'El CMP debe ser texto.' })
    @MaxLength(20, { message: 'El CMP no puede superar 20 caracteres.' })
    cmp: string;

    @ApiProperty({
        description: 'URL o path del archivo PDF de sustento médico',
        example: 'https://ejemplo.com/licencia.pdf',
    })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El archivo de sustento es obligatorio.' })
    @IsString({ message: 'El archivo de sustento debe ser texto.' })
    archivo_sustento_pdf: string;

    @ApiProperty({
        description: 'Fecha de inicio de la licencia médica',
        example: '2024-02-10',
        type: String,
        format: 'date',
    })
    @Type(() => Date)
    @IsDate({ message: "El formato de la fecha de inicio no es válido." })
    @IsNotEmpty({ message: "La fecha de inicio es un campo requerido." })
    fecha_inicio: Date;

    @ApiProperty({
        description: 'Cantidad de días de descanso médico',
        example: 5,
        type: Number,
    })
    @IsNotEmpty({ message: 'Los días de descanso son obligatorios.' })
    @IsInt({ message: 'Los días de descanso deben ser un número entero.' })
    @IsPositive({ message: 'Los días de descanso deben ser mayor a cero.' })
    dias_descanso: number;


    @ApiProperty({
        description: 'Estado de la licencia médica',
        enum: EstadoLicenciaEnum,
        example: EstadoLicenciaEnum.PENDIENTE,
        required: false,
    })
    @IsOptional()
    @IsEnum(EstadoLicenciaEnum, { message: 'Estado de licencia inválido.' })
    estado?: EstadoLicenciaEnum;

    @ApiProperty({
        description: 'Observaciones adicionales sobre la licencia',
        example: 'Requiere seguimiento',
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'Las observaciones deben ser texto.' })
    observaciones?: string;
}
