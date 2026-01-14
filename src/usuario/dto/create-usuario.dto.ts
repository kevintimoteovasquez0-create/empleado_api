import { Transform, Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { TipoDocumentoUsuarioList } from "../enum/usuario.enum";
import type { TipoDocumentoUsuarioType } from "../enum/usuario.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUsuarioDto {

  // Datos del usuario

  @ApiPropertyOptional({ description: 'ID del rol del usuario', example: 1 })
  @IsOptional()
  rol_id?: number;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50, { message: "El nombre no puede superar los 50 caracteres." })
  @IsNotEmpty({ message: "El nombre es obligatorio." })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50, { message: "El apellido no pueden superar los 50 caracteres." })
  @IsNotEmpty({ message: "El apellido es obligatorio." })
  apellido: string;

  @ApiProperty({ description: 'Tipo de documento del usuario', example: 'DNI', enum: TipoDocumentoUsuarioList })
  @IsNotEmpty({ message: "El tipo de documento es obligatorio." })
  @IsEnum(TipoDocumentoUsuarioList, {
    message: `Solamente estan permitidos los siguientes tipos de documento ${TipoDocumentoUsuarioList}`
  })
  tipo_documento: TipoDocumentoUsuarioType;

  @ApiProperty({ description: 'Número de documento del usuario', example: '12345678' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "El número de documento es obligatorio." })
  @Matches(/^\d{8}$/, { message: "El número de documento solo puede contener 8 dígitos numéricos." })
  numero_documento: string;

  @ApiProperty({ description: 'Fecha de nacimiento del usuario', example: '1990-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate({ message: "La fecha de nacimiento debe ser una fecha válida." })
  @IsNotEmpty({ message: "La fecha de nacimiento es obligatorio." })
  fecha_nacimiento: Date;

  @ApiProperty({ description: 'Fecha de ingreso del usuario', example: '2025-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate({ message: "La fecha de ingreso debe ser una fecha válida." })
  @IsNotEmpty({ message: "La fecha de ingreso es obligatorio." })
  fecha_ingreso: Date;

  @ApiProperty({ description: 'Dirección del usuario', example: 'Av. Siempre Viva 123' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: "La dirección es obligatorio." })
  direccion: string;

  @ApiProperty({ description: 'País del usuario', example: 'Perú' })
  @IsString()
  @IsNotEmpty({ message: "El país es obligatorio." })
  pais: string;

  @ApiProperty({ description: 'Departamento del usuario', example: 'Lima' })
  @IsString()
  @IsNotEmpty({ message: "El departamento es obligatorio." })
  departamento: string;

  @ApiProperty({ description: 'Provincia del usuario', example: 'Lima' })
  @IsString()
  @IsNotEmpty({ message: "La provincia es obligatorio." })
  provincia: string;

  @ApiProperty({ description: 'Distrito del usuario', example: 'Miraflores' })
  @IsString()
  @IsNotEmpty({ message: "El distrito es obligatorio." })
  distrito: string;

  @ApiProperty({ description: 'Número de teléfono del usuario', example: '987654321' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "El número de telefono es obligatorio." })
  @Matches(/^\d{9}$/, { message: "El número de telefono debe contener 9 dígitos numéricos." })
  telefono: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan.perez@email.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty({ message: "El email es obligatorio." })
  @IsEmail({}, { message: "El email no es válido." })
  @MaxLength(60)
  email: string;
}
