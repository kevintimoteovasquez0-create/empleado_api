import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateAreaDto {

  @ApiProperty({
    description: 'Nombre del área',
    example: 'Recursos Humanos',
    type: String,
    maxLength: 50,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'El nombre del área es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres.' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del área',
    example: 'Área encargada de la gestión del personal y talento humano',
    type: String,
    maxLength: 150,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(150, { message: 'La descripción no puede superar los 150 caracteres.' })
  descripcion: string;

  @ApiProperty({
    description: 'ID del usuario responsable del área',
    example: 3,
    type: Number,
  })
  @IsNotEmpty({ message: 'El responsable es obligatorio.' })
  @IsInt({ message: 'El ID del responsable debe ser un número entero.' })
  @IsPositive({ message: 'El ID del responsable debe ser mayor que cero.' })
  responsable_id: number;
}