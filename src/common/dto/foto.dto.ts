import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FotoDto {

  @ApiProperty({
    example: 'https://mi-cdn.com/fotos/cliente_123.jpg',
    description: 'URL pública de la foto'
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La URL de la foto es obligatoria.' })
  @MaxLength(255, { message: 'La URL de la foto no puede superar los 255 caracteres.' })
  foto_url: string;

}