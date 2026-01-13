import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class NumeroDto {

  @ApiProperty({
    description: 'Número de documento (DNI), debe tener exactamente 8 dígitos',
    example: '12345678'
  })
  @IsString()
  @Length(8, 8, {
    message: 'El número de documento debe tener exactamente 8 dígitos'
  })
  numero: string;
}