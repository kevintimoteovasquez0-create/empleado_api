import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class CreatePostulacionDto {

  @ApiProperty({
    description: 'Número de DNI del postulante',
    example: '74859632',
    maxLength: 20,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El DNI es obligatorio.' })
  @IsString({ message: 'El DNI debe ser texto.' })
  @MaxLength(20, { message: 'El DNI no puede superar 20 caracteres.' })
  dni: string;

  @ApiProperty({
    description: 'Nombres del postulante',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Los nombres son obligatorios.' })
  @IsString({ message: 'Los nombres deben ser texto.' })
  @MaxLength(100, { message: 'Los nombres no pueden superar 100 caracteres.' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del postulante',
    example: 'Pérez García',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
  @IsString({ message: 'Los apellidos deben ser texto.' })
  @MaxLength(100, {
    message: 'Los apellidos no pueden superar 100 caracteres.',
  })
  apellidos: string;

  @ApiProperty({
    description: 'Número de teléfono del postulante',
    example: '987654321',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(20, { message: 'El teléfono no puede superar 20 caracteres.' })
  telefono: string;

  @ApiProperty({
    description: 'Correo electrónico del postulante',
    example: 'juan.perez@email.com',
    maxLength: 100,
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @IsEmail({}, { message: 'Formato de email inválido.' })
  @MaxLength(100, { message: 'El email no puede superar 100 caracteres.' })
  email: string;

  @ApiProperty({
    description: 'Experiencia del postulante',
    example: '3 años en desarrollo web',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La experiencia debe ser texto.' })
  @MaxLength(50, { message: 'La experiencia no puede superar 50 caracteres.' })
  experiencia: string;

  @ApiProperty({
    description: 'Motivo por el cual postula',
    example: 'Interés en crecer profesionalmente en una empresa innovadora',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo debe ser texto.' })
  motivo: string;

  @ApiProperty({
    description: 'Ruta del archivo CV en PDF',
    example: 'cv_juanperez_20240115_143022.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La ruta del CV debe ser texto.' })
  cv_pdf: string;
}
