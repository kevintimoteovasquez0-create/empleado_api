import { PartialType } from '@nestjs/swagger';
import { CreateEmpleadoDto, DocumentoValidator } from './create-empleado.dto';
import { Validate } from 'class-validator';

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
  @Validate(DocumentoValidator)
  numero_documento?: string;
}
