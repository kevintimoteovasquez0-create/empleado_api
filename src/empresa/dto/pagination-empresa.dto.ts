import { PartialType } from "@nestjs/mapped-types";
import { PaginationDto } from "src/common";

export class PaginationEmpresaDto extends PartialType(PaginationDto){}