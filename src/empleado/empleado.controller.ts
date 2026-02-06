import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { PaginationDto } from 'src/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) { }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los empleados',
    description: 'Retorna una lista paginada de empleados. Se puede filtrar por estado.',
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
    description: 'Lista de empleados obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllEmpleados(
    @Query() paginationDto: PaginationDto,
    @Query("estado", ParseBoolPipe) estado: boolean
  ) {

    const estadoValidado = estado ?? true
    return this.empleadoService.findAllEmpleados(paginationDto, estadoValidado);
  }

  //--------------------------------------------------

  @Get(":id")
  @ApiOperation({
    summary: 'Obtener empleado por ID',
    description: 'Retorna la información de un empleado específico según su ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado',
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
    description: 'Empleado obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  findEmpleadosById(
    @Param("id", ParseIntPipe) id: number,
    @Query("estado", ParseBoolPipe) estado: boolean
  ) {
    const estadoValidado = estado ?? true
    return this.empleadoService.findEmpleadosById(id, estadoValidado)
  }

  //--------------------------------------------------

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo empleado',
    description: 'Crea un nuevo empleado y lo asocia a un usuario y un área.',
  })
  @ApiBody({
    type: CreateEmpleadoDto,
    description: 'Datos necesarios para crear un empleado',
  })
  @ApiResponse({
    status: 201,
    description: 'Empleado creado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  createEmpleados(
    @Body() createEmpleadosDto: CreateEmpleadoDto
  ) {
    return this.empleadoService.createEmpleados(createEmpleadosDto)
  }

  //--------------------------------------------------

  @Put(":id")
  @ApiOperation({
    summary: 'Actualizar un empleado',
    description: 'Actualiza la información de un empleado existente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateEmpleadoDto,
    description: 'Datos que se pueden actualizar del empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  updateEmpleados(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEmpleadosDto: UpdateEmpleadoDto
  ) {
    return this.empleadoService.updateEmpleados(id, updateEmpleadosDto)
  }

  //--------------------------------------------

  @Patch(":id/restore")
  @ApiOperation({
    summary: 'Restaurar empleado',
    description: 'Restaura un empleado que fue desactivado previamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado a restaurar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado restaurado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  restoreEmpleados(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.empleadoService.restoreEmpleados(id)
  }

  //------------------------------------------------

  @Patch(":id/remove")
  @ApiOperation({
    summary: 'Eliminar empleado',
    description: 'Desactiva (soft delete) un empleado del sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  removeEmpleados(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.empleadoService.removeEmpleados(id)
  }

  //Apis extras

  // @Get(":id/documentos")
  // obtenerDocumentosEmpleados(
  //   @Param("id", ParseIntPipe) id: number
  // ) {
  //   return this.empleadoService.obtenerDocumentosEmpleados(id)
  // }
}

