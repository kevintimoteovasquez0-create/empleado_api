import { PartialType } from '@nestjs/swagger';
import { CreateRequisitoDocumentoDto } from './create-requisito-documento.dto';

export class UpdateRequisitoDocumentoDto extends PartialType(CreateRequisitoDocumentoDto) {}