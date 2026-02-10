import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { PaginationDto } from 'src/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('contratos')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los contratos',
    description:
      'Retorna una lista paginada de contratos. Se puede filtrar por estado.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: Boolean,
    description:
      'Filtrar por estado del registro (true/false). Por defecto: true',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contratos obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllContratos(
    @Query() paginationDto: PaginationDto,
    @Query('estado', ParseBoolPipe) estado: boolean,
  ) {
    const estadoValidado = estado ?? true;
    return this.contratoService.findAllContratos(paginationDto, estadoValidado);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener contrato por ID',
    description:
      'Retorna la información de un contrato específico según su ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del contrato',
    example: 1,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: Boolean,
    description:
      'Filtrar por estado del registro (true/false). Por defecto: true',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado',
  })
  findContratoById(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado', ParseBoolPipe) estado: boolean,
  ) {
    const estadoValidado = estado ?? true;
    return this.contratoService.findContratoById(id, estadoValidado);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo contrato',
    description: 'Crea un nuevo contrato y lo asocia a un empleado.',
  })
  @ApiBody({
    type: CreateContratoDto,
    description: 'Datos necesarios para crear un contrato',
  })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  createContrato(@Body() createContratoDto: CreateContratoDto) {
    return this.contratoService.createContrato(createContratoDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un contrato',
    description: 'Actualiza la información de un contrato existente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del contrato a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateContratoDto,
    description: 'Datos que se pueden actualizar del contrato',
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado',
  })
  updateContrato(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContratoDto: UpdateContratoDto,
  ) {
    return this.contratoService.updateContrato(id, updateContratoDto);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar contrato',
    description: 'Restaura un contrato que fue desactivado previamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del contrato a restaurar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato restaurado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado',
  })
  restoreContrato(@Param('id', ParseIntPipe) id: number) {
    return this.contratoService.restoreContrato(id);
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Eliminar contrato',
    description: 'Desactiva (soft delete) un contrato del sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del contrato a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado',
  })
  removeContrato(@Param('id', ParseIntPipe) id: number) {
    return this.contratoService.removeContrato(id);
  }
}
