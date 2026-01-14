import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { EmpresaTable } from 'src/drizzle/schema/empresa';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class EmpresaService {

    private readonly db;

    constructor(private readonly drizzleService: DrizzleService){
        this.db = drizzleService.getDb();
    }
    
    async findAllEmpresa(paginationDto: PaginationDto, estado: boolean){

        try {
            const { page, limit } = paginationDto

            const safeLimit = limit ?? 10;
            const safePage = page ?? 1;

            const totalEmpresa = await this.db
                .select({ count: this.db.fn.count() })
                .from(EmpresaTable)
                .where(eq(EmpresaTable.estado_registro, true));

            const lastPage = Math.ceil(totalEmpresa / safeLimit)

            const response = await this.db
                .select()
                .from(EmpresaTable)
                .where(eq(EmpresaTable.estado_registro, estado))
                .limit(limit)
                .offset((safePage - 1) * safeLimit);

            return {
                data: response,
                pagination: {
                    totalEmpresa: totalEmpresa,
                    page: page,
                    lastPage: lastPage
                },
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }
    
    async findOneEmpresa(id: number, estado: boolean){
        try {

            const response = await this.db
                .select()
                .from(EmpresaTable)
                .where(
                    and(
                        eq(EmpresaTable.id, id),
                        eq(EmpresaTable.estado_registro, estado)
                    )
                )
                .limit(1);

            if(!response){
                throw new NotFoundException(`No se encontro la empresa con id ${id}`)
            }

            return {
                ...response
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    
    async createEmpresa(createEmpresaDto: CreateEmpresaDto){
        try {
            
            await this.db
                .insert(EmpresaTable)
                .values(createEmpresaDto);

            return {
                message: "Empresa creada correctamente"
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    
    async updateEmpresa(updateEmpresaDto: UpdateEmpresaDto, id: number){

        try {
            
            await this.findOneEmpresa(id, true)

            await this.db
                .update(EmpresaTable)
                .set(updateEmpresaDto)
                .where(eq(EmpresaTable.id, id))

            return {
                message: `La empresa con id ${id} ha sido actualizada correctamente`
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
        
    }
    
    async removeEmpresa(id: number){

        try {

            await this.findOneEmpresa(id, true)
            
            await this.db
                .update(EmpresaTable)
                .set({ 
                    estadoRegistro: false,
                    updatedAt: new Date()
                })
                .where(eq(EmpresaTable.id, id))

            return {
                message: `La empresa con id ${id} ha sido eliminada correctamente`
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async restaurarEmpresa(id: number){
        try {

            await this.findOneEmpresa(id, false)

            await this.db
                .update(EmpresaTable)
                .set({ estadoRegistro: true })
                .where(eq(EmpresaTable.id, id))

            return {
                message: `La empresa con id ${id} ha sido restaurada correctamente`
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    
}
