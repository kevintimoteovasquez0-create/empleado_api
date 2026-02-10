import { PartialType } from '@nestjs/swagger';
import { CreatePostulacionDto } from './create-postulacion.dto';

export class UpdatePostulacionDto extends PartialType(CreatePostulacionDto) {}
