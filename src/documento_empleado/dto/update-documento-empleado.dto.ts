import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoEmpleadoDto } from './create-documento-empleado.dto';

export class UpdateDocumentoEmpleadoDto extends PartialType(
  CreateDocumentoEmpleadoDto,
) {}
