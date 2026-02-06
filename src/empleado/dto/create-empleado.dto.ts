import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, Matches, MaxLength, ValidateIf } from "class-validator";

export enum DocumentoEnumDto {
  DNI = 'dni',
  CARNET_EXTRANJERIA = 'carnet_extranjeria',
}

export enum TipoPersonalEnum {
  PLANILLA = 'planilla',
  PRACTICANTE = 'practicante',
}

export enum EstadoLegajoEnum {
  AL_DIA = 'al_dia',
  PENDIENTE = 'pendiente',
  OBSERVADO = 'observado',
}

export class CreateEmpleadoDto {

  @ApiProperty({
    description: 'ID del usuario asociado al empleado',
    example: 12,
    type: Number,
  })
  @IsNotEmpty({ message: 'El usuario es obligatorio.' })
  @IsInt({ message: 'El usuario debe ser un número entero.' })
  @IsPositive({ message: 'El usuario debe ser mayor a cero.' })
  usuario_id: number;

  @ApiProperty({
    description: 'ID del área a la que pertenece el empleado',
    example: 3,
    type: Number,
  })
  @IsNotEmpty({ message: 'El área es obligatoria.' })
  @IsInt({ message: 'El área debe ser un número entero.' })
  @IsPositive({ message: 'El área debe ser mayor a cero.' })
  area_id: number;

  @ApiProperty({
    description: 'Nombres del empleado',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Los nombres son obligatorios.' })
  @IsString({ message: 'Los nombres deben ser texto.' })
  @MaxLength(100, { message: 'Los nombres no pueden superar 100 caracteres.' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del empleado',
    example: 'Pérez Gómez',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
  @IsString({ message: 'Los apellidos deben ser texto.' })
  @MaxLength(100, { message: 'Los apellidos no pueden superar 100 caracteres.' })
  apellidos: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad',
    enum: DocumentoEnumDto,
    example: DocumentoEnumDto.DNI,
  })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio.' })
  @IsEnum(DocumentoEnumDto, { message: 'Tipo de documento inválido.' })
  tipo_documento: DocumentoEnumDto;

  @ApiProperty({
    description: 'Número de documento según el tipo seleccionado',
    example: '74859632',
  })
  @IsString()
  @ValidateIf(o => o.tipo_documento === DocumentoEnumDto.DNI)
  @Length(8, 8, {
    message: "El DNI debe tener 8 caracteres",
  })
  @ValidateIf(o => o.tipo_documento === DocumentoEnumDto.CARNET_EXTRANJERIA)
  @Length(9, 12, {
    message: "Carnet de extranjeria inválido",
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Cargo que ocupa el empleado',
    example: 'Analista de Sistemas',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El cargo es obligatorio.' })
  @IsString({ message: 'El cargo debe ser texto.' })
  @MaxLength(100, { message: 'El cargo no puede superar 100 caracteres.' })
  cargo: string;

  @ApiProperty({
    description: 'Tipo de personal del empleado',
    enum: TipoPersonalEnum,
    example: TipoPersonalEnum.PLANILLA,
  })
  @IsNotEmpty({ message: 'El tipo de personal es obligatorio.' })
  @IsEnum(TipoPersonalEnum, { message: 'Tipo de personal inválido.' })
  tipo_personal: TipoPersonalEnum;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @IsDate({ message: "El formato de la fecha de ingreso no es válido." })
  @IsNotEmpty({ message: "La fecha de ingreso es un campo requerido." })
  fecha_ingreso: Date;


  @ApiProperty({
    description: 'Fecha de nacimiento del empleado',
    example: '1998-05-20',
    type: String,
    format: 'date',
  })
  @IsDate({ message: "El formato de la fecha de nacimiento no es válido." })
  @IsNotEmpty({ message: "La fecha de nacimiento es un campo requerido." })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Número de teléfono del empleado',
    example: '987654321',
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @Matches(/^\d{9}$/, { message: 'El teléfono debe tener 9 dígitos.' })
  telefono: string;

  @ApiProperty({
    description: 'Correo corporativo del empleado',
    example: 'juan.perez@empresa.com',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El correo corporativo es obligatorio.' })
  @IsEmail({}, { message: 'Correo corporativo inválido.' })
  @MaxLength(100, { message: 'El correo no puede superar 100 caracteres.' })
  email_corporativo: string;

  @ApiProperty({
    description: 'Dirección del empleado',
    example: 'Av. Los Próceres 123',
    maxLength: 255,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  @IsString({ message: 'La dirección debe ser texto.' })
  @MaxLength(255, { message: 'La dirección no puede superar 255 caracteres.' })
  direccion: string;

  @ApiProperty({
    description: 'Distrito de residencia del empleado',
    example: 'San Miguel',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El distrito es obligatorio.' })
  @IsString({ message: 'El distrito debe ser texto.' })
  @MaxLength(100, { message: 'El distrito no puede superar 100 caracteres.' })
  distrito: string;

  @ApiProperty({
    description: 'Estado del legajo del empleado',
    enum: EstadoLegajoEnum,
    example: EstadoLegajoEnum.PENDIENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoLegajoEnum, { message: 'Estado de legajo inválido.' })
  estado_legajo?: EstadoLegajoEnum;
}