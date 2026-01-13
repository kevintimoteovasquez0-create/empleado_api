import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmpresaService } from './empresa.service';
import { PaginationDto } from 'src/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@ApiTags('Empresa')
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService){}

  @Get()
  @ApiOperation({
    summary: 'Listar empresas',
    description: 'Obtiene un listado paginado de empresas, con opción de filtrar por estado',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado (true | false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de empresas obtenido correctamente',
  })
  findAllEmpresa(
    @Query() paginationDto: PaginationDto,
    @Query('estado') estado?: string
  ){
    const estadoBoolean = estado === 'false' ? false : true;
    return this.empresaService.findAllEmpresa(paginationDto, estadoBoolean)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener empresa por ID',
    description: 'Obtiene la información de una empresa según su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa',
    type: Number,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado (true | false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa obtenida correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  findOneEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado') estado?: string
  ){
    const estadoBoolean = estado === 'false' ? false : true;
    return this.empresaService.findOneEmpresa(id, estadoBoolean)
  }

  @Post()
  @ApiOperation({
    summary: 'Crear empresa',
    description: 'Crea una nueva empresa con razón social y RUC',
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada correctamente',
  })
  createEmpresa(@Body() createEmpresaDto: CreateEmpresaDto){
    return this.empresaService.createEmpresa(createEmpresaDto)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar empresa',
    description: 'Actualiza los datos de una empresa existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada correctamente',
  })
  updateEmpresa(
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @Param('id', ParseIntPipe) id: number
  ){
    return this.empresaService.updateEmpresa(updateEmpresaDto, id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Eliminar empresa',
    description: 'Elimina (lógicamente) una empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa eliminada correctamente',
  })
  removeEmpresa(@Param('id', ParseIntPipe) id: number){
    return this.empresaService.removeEmpresa(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Restaurar empresa',
    description: 'Restaura una empresa previamente eliminada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa restaurada correctamente',
  })
  restaurarEmpresa(@Param('id', ParseIntPipe) id: number){
    return this.empresaService.restaurarEmpresa(id)
  }
}