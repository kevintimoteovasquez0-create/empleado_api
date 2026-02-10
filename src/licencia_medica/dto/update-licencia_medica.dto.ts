import { PartialType } from '@nestjs/swagger';
import { CreateLicenciaMedicaDto } from './create-licencia_medica.dto';

export class UpdateLicenciaMedicaDto extends PartialType(
  CreateLicenciaMedicaDto,
) {}
