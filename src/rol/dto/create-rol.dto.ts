import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class AccesoDto {
  @ApiProperty({
    description: 'ID del acceso',
    example: 1
  })
  @IsNotEmpty({ message: 'El ID del acceso es obligatorio.' })
  @IsInt({ message: 'El ID del acceso debe ser un número.' })
  id: number;
}

export class CreateRolDto {

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'Administrador'
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es requerido.' })
  nombre: string;

  @ApiProperty({
    description: 'Lista de accesos asociados al rol',
    type: [AccesoDto]
  })
  @IsArray({ message: 'El campo debe ser un Array' })
  @ArrayMinSize(1, { message: 'Se debe proporcionar al menos un acceso.' })
  @ValidateNested({ each: true })
  @Type(() => AccesoDto)
  accesos: AccesoDto[];
}