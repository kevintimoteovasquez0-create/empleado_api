import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional } from "class-validator";
import { PaginationDto } from "../../common";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationUsuarioDto extends PartialType(PaginationDto){

  @ApiPropertyOptional({ 
    description: 'Fecha de inicio para filtrar usuarios por fecha de creación', 
    example: '2025-01-01T00:00:00.000Z' 
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de fin para filtrar usuarios por fecha de creación', 
    example: '2025-01-31T23:59:59.000Z' 
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ 
    description: 'ID del rol para filtrar usuarios por rol', 
    example: 2 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rolId?: number;

}