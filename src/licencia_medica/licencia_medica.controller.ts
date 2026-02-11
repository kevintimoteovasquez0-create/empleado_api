import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { LicenciaMedicaService } from './licencia_medica.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateLicenciaMedicaDto } from './dto/create-licencia-medica.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateEstadoLicenciaMedicaDto } from './dto/update-estado-licencia-medica.dto';

@ApiTags('Licencias medicas')
@Controller('licencia-medica')
export class LicenciaMedicaController {
    constructor(private readonly licenciaMedicaService: LicenciaMedicaService) { }

    @Get()
    @ApiOperation({
        summary: 'Obtener todas las licencias médicas',
        description: 'Retorna una lista paginada de licencias médicas. Se puede filtrar por estado.',
    })
    @ApiQuery({
        name: 'estado',
        required: false,
        type: Boolean,
        description: 'Filtrar por estado del registro (true/false). Por defecto: true',
        example: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de licencias médicas obtenida exitosamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Parámetros de consulta inválidos',
    })
    findAllLicenciasMedicas(
        @Query() paginationDto: PaginationDto,
        @Query("estado", ParseBoolPipe) estado: boolean
    ) {
        const estadoValidado = estado ?? true
        return this.licenciaMedicaService.findAllLicenciasMedicas(paginationDto, estadoValidado);
    }

    //--------------------------------------------------

    @Get(":id")
    @ApiOperation({
        summary: 'Obtener licencia médica por ID',
        description: 'Retorna la información de una licencia médica específica según su ID.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID de la licencia médica',
        example: 1,
    })
    @ApiQuery({
        name: 'estado',
        required: false,
        type: Boolean,
        description: 'Filtrar por estado del registro (true/false). Por defecto: true',
        example: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Licencia médica obtenida exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Licencia médica no encontrada',
    })
    findLicenciaMedicaById(
        @Param("id", ParseIntPipe) id: number,
        @Query("estado", ParseBoolPipe) estado: boolean
    ) {
        const estadoValidado = estado ?? true
        return this.licenciaMedicaService.findLicenciaMedicaById(id, estadoValidado)
    }

    //--------------------------------------------------

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva licencia médica',
        description: 'Crea una nueva licencia médica y la asocia a un empleado.',
    })
    @ApiBody({
        type: CreateLicenciaMedicaDto,
        description: 'Datos necesarios para crear una licencia médica',
    })
    @ApiResponse({
        status: 201,
        description: 'Licencia médica creada correctamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    createLicenciaMedica(
        @Body() createLicenciaMedicaDto: CreateLicenciaMedicaDto
    ) {
        return this.licenciaMedicaService.createLicenciaMedica(createLicenciaMedicaDto)
    }

    //--------------------------------------------------

    @Patch(":id/estado")
    @ApiOperation({
        summary: 'Aprobar o rechazar una licencia médica',
        description: 'Actualiza el estado de una licencia médica existente ademas de añadir opcionalmente algunas observaciones.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID de la licencia médica cuyo estado se actualizará',
        example: 1,
    })
    @ApiBody({
        type: UpdateEstadoLicenciaMedicaDto,
        description: 'Objeto con el nuevo estado de la licencia',
    })
    @ApiResponse({
        status: 200,
        description: 'Estado de la licencia médica actualizado correctamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Licencia médica no encontrada',
    })
    actualizarEstadoLicencia(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateEstadoLicenciaMedicaDto: UpdateEstadoLicenciaMedicaDto,
    ) {
        return this.licenciaMedicaService.actualizarEstadoLicencia(id, updateEstadoLicenciaMedicaDto);
    }

    //--------------------------------------------

    @Patch(":id/restore")
    @ApiOperation({
        summary: 'Restaurar licencia médica',
        description: 'Restaura una licencia médica que fue desactivada previamente.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID de la licencia médica a restaurar',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Licencia médica restaurada correctamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Licencia médica no encontrada',
    })
    restoreLicenciaMedica(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.licenciaMedicaService.restoreLicenciaMedica(id)
    }

    //------------------------------------------------

    @Patch(":id/remove")
    @ApiOperation({
        summary: 'Eliminar licencia médica',
        description: 'Desactiva una licencia médica del sistema.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID de la licencia médica a eliminar',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Licencia médica eliminada correctamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Licencia médica no encontrada',
    })
    removeLicenciaMedica(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.licenciaMedicaService.removeLicenciaMedica(id)
    }
}
