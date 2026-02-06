import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { AreaService } from './area.service';
import { PaginationDto } from 'src/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) { }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las áreas',
    description: 'Retorna una lista paginada de áreas. Se puede filtrar por estado.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado (true = activas, false = inactivas). Por defecto: true',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de áreas obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllAreas(
    @Query() paginationDto: PaginationDto,
    @Query("estado", ParseBoolPipe) estado: boolean
  ) {

    const estadoValidado = estado ?? true
    return this.areaService.findAllAreas(paginationDto, estadoValidado);
  }

  // ----------------------------------------------------

  @Get(":id")
  @ApiOperation({
    summary: 'Obtener un área por ID',
    description: 'Retorna la información de un área específica según su ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del área',
    example: 5,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado del área. Por defecto: true',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Área encontrada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada',
  })
  findAreasById(
    @Param("id", ParseIntPipe) id: number,
    @Query("estado", ParseBoolPipe) estado: boolean
  ) {
    const estadoValidado = estado ?? true
    return this.areaService.findAreasById(id, estadoValidado)
  }

  // ----------------------------------------------------

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva área',
    description: 'Crea un área nueva con su responsable asignado.',
  })
  @ApiBody({
    type: CreateAreaDto,
    description: 'Datos necesarios para crear un área',
  })
  @ApiResponse({
    status: 201,
    description: 'Área creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  createAreas(
    @Body() createAreaDto: CreateAreaDto
  ) {
    return this.areaService.createAreas(createAreaDto)
  }

  // ----------------------------------------------------

  @Put(":id")
  @ApiOperation({
    summary: 'Actualizar un área',
    description: 'Actualiza los datos de un área existente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del área a actualizar',
    example: 5,
  })
  @ApiBody({
    type: UpdateAreaDto,
    description: 'Datos a actualizar del área',
  })
  @ApiResponse({
    status: 200,
    description: 'Área actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada',
  })
  updateAreas(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto
  ) {
    return this.areaService.updateAreas(id, updateAreaDto)
  }

  // ----------------------------------------------------

  @Patch(":id/restore")
  @ApiOperation({
    summary: 'Restaurar un área',
    description: 'Restaura un área que fue eliminada lógicamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del área a restaurar',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Área restaurada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada',
  })
  restoreAreas(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.areaService.restoreAreas(id)
  }

  // ----------------------------------------------------

  @Patch(":id/remove")
  @ApiOperation({
    summary: 'Eliminar un área',
    description: 'Elimina un área de forma lógica (soft delete).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del área a eliminar',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Área eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada',
  })
  removeAreas(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.areaService.removeAreas(id)
  }

  //Apis extras

  @Get(":id/empleados")
  @ApiOperation({
    summary: 'Obtener empleados de un área',
    description: 'Retorna la lista de empleados asociados a un área.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del área',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada',
  })
  obtenerEmpleadosAreas(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.areaService.obtenerEmpleadosAreas(id)
  }
}
