import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";

export enum EstadoLicenciaEnum {
    PENDIENTE = 'pendiente',
    APROBADO = 'aprobado',
    RECHAZADO = 'rechazado',
}

export class UpdateEstadoLicenciaMedicaDto {

  @ApiProperty({
    description: 'Estado de la licencia médica',
    enum: EstadoLicenciaEnum,
    example: EstadoLicenciaEnum.PENDIENTE,
    required: true,
  })
  @IsEnum(EstadoLicenciaEnum, { message: 'Estado de licencia inválido.' })
  estado: EstadoLicenciaEnum;

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
