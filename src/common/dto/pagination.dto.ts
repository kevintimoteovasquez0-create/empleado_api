import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página (debe ser un número positivo)',
    default: 1
  })
  @IsOptional()
  @IsPositive({ message: 'La página debe ser un número positivo.' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de registros por página (debe ser un número positivo)',
    default: 10
  })
  @IsOptional()
  @IsPositive({ message: 'El límite debe ser un número positivo.' })
  @Type(() => Number)
  limit?: number = 10;

}