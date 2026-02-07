import { PartialType } from "@nestjs/swagger";
import { CreateLicenciaMedicaDto } from "./create-licencia-medica.dto";

export class UpdateLicenciaMedicaDto extends PartialType(CreateLicenciaMedicaDto) { }
