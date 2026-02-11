import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum EstadoPostulacionEnumDto {
  PENDIENTE = 'PENDIENTE',
  REVISADO = 'REVISADO',
  PRESELECCIONADO = 'PRESELECCIONADO',
  NO_APTO = 'NO_APTO',
  APROBADO = 'APROBADO',
}

export class UpdateEstadoPostulacionDto {
  @ApiProperty({
    description: 'Estado de la postulación',
    enum: EstadoPostulacionEnumDto,
    example: EstadoPostulacionEnumDto.PENDIENTE,
    required: true, 
  })
  @IsEnum(EstadoPostulacionEnumDto, {
    message: 'Estado de postulación inválido.',
  })
  estado: EstadoPostulacionEnumDto;
}
