import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { and, getTableColumns, count, eq } from 'drizzle-orm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { LicenciaMedicaTable } from 'src/drizzle/schema/licencia_medica';
import { EmpleadoTable } from 'src/drizzle/schema/empleado';
import { CreateLicenciaMedicaDto } from './dto/create-licencia-medica.dto';
import { UpdateLicenciaMedicaDto } from './dto/update-licencia-medica.dto';

@Injectable()
export class LicenciaMedicaService {

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }

    private get db() {
        return this.drizzleService.getDb();
    }

    async findAllLicenciasMedicas(paginationDto: PaginationDto, estado: boolean) {
        try {

            const { page, limit } = paginationDto

            const [{ total }] = await this.db
                .select({ total: count() })
                .from(LicenciaMedicaTable)
                .where(eq(LicenciaMedicaTable.estado_registro, estado))

            const getAllRegistrosLicencia = Number(total)

            const finalPage = page ?? 1
            const finalLimit = limit ?? 10

            const numberPages = Math.ceil(getAllRegistrosLicencia / finalLimit)

            const { empleado_id, ...restoCamposLicencia } = getTableColumns(LicenciaMedicaTable)

            const responseLicencias = await this.db
                .select({
                    ...restoCamposLicencia,
                    empleado: {
                        id: EmpleadoTable.id,
                        nombres: EmpleadoTable.nombres,
                        apellidos: EmpleadoTable.apellidos
                    }
                })
                .from(LicenciaMedicaTable)
                .innerJoin(EmpleadoTable, eq(LicenciaMedicaTable.empleado_id, EmpleadoTable.id))
                .where(eq(LicenciaMedicaTable.estado_registro, estado))
                .limit(finalLimit)
                .offset((finalPage - 1) * finalLimit)

            return {
                data: responseLicencias,
                pagination: {
                    total: getAllRegistrosLicencia,
                    page: finalPage,
                    limit: finalLimit,
                    finalPage: numberPages
                }
            }

        } catch (error) {
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async findLicenciaMedicaById(id: number, estado: boolean) {
        try {

            const { empleado_id, ...restoCamposLicencia } = getTableColumns(LicenciaMedicaTable)

            const [response] = await this.db
                .select({
                    ...restoCamposLicencia,
                    empleado: {
                        id: EmpleadoTable.id,
                        nombres: EmpleadoTable.nombres,
                        apellidos: EmpleadoTable.apellidos
                    }
                })
                .from(LicenciaMedicaTable)
                .innerJoin(EmpleadoTable, eq(LicenciaMedicaTable.empleado_id, EmpleadoTable.id))
                .where(
                    and(
                        eq(LicenciaMedicaTable.id, id),
                        eq(LicenciaMedicaTable.estado_registro, estado))
                )
                .limit(1)

            if (!response) {
                throw new NotFoundException(`No se encontró la licencia médica con id ${id}`)
            }

            return response

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async createLicenciaMedica(createLicenciaMedicaDto: CreateLicenciaMedicaDto) {
        try {

            await this.db
                .insert(LicenciaMedicaTable)
                .values({ ...createLicenciaMedicaDto })

            return {
                message: "Licencia médica creada correctamente"
            }

        } catch (error) {
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async updateLicenciaMedica(id: number, updateLicenciaMedicaDto: UpdateLicenciaMedicaDto) {
        try {
            await this.findLicenciaMedicaById(id, true)

            await this.db
                .update(LicenciaMedicaTable)
                .set({ ...updateLicenciaMedicaDto })
                .where(eq(LicenciaMedicaTable.id, id))

            return {
                message: "Licencia médica actualizada correctamente"
            }

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async restoreLicenciaMedica(id: number) {
        try {

            await this.findLicenciaMedicaById(id, false)

            await this.db
                .update(LicenciaMedicaTable)
                .set({ estado_registro: true })
                .where(eq(LicenciaMedicaTable.id, id))

            return {
                message: "Licencia médica restaurada correctamente"
            }

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async removeLicenciaMedica(id: number) {
        try {

            await this.findLicenciaMedicaById(id, true)

            await this.db
                .update(LicenciaMedicaTable)
                .set({ estado_registro: false })
                .where(eq(LicenciaMedicaTable.id, id))

            return {
                message: "Licencia médica removida correctamente"
            }

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`,
            );
        }
    }

    async obtenerLicenciasEmpleado(empleadoId: number) {
        try {
            const licencias = await this.db
                .select()
                .from(LicenciaMedicaTable)
                .where(
                    and(
                        eq(LicenciaMedicaTable.empleado_id, empleadoId),
                        eq(LicenciaMedicaTable.estado_registro, true)
                    )
                )

            return licencias

        } catch (error) {
            throw new InternalServerErrorException(
                `Ocurrió un error con el sistema: ${error}`
            );
        }
    }
}
