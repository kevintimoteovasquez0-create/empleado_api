import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ConvocatoriaService } from './convocatoria.service';
import { PaginationConvocatoriaDto } from './dto/pagination-convocatoria.dto';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';
import { UpdateConvocatoriaDto } from './dto/update-convocatoria.dto';
import { CreatePostulacionDto } from 'src/postulacion/dto/create-postulacion.dto';
import { PaginationDto } from 'src/common';

@ApiTags('Convocatorias')
@Controller('convocatoria')
export class ConvocatoriaController {
  constructor(private readonly convocatoriaService: ConvocatoriaService) { }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las convocatorias',
    description: 'Retorna una lista paginada de convocatorias. Se puede filtrar por estado.'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: String,
    description: 'Filtrar por estado (true/false). Por defecto: true',
    example: 'true'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de convocatorias obtenida exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos'
  })
  findAllConvocatorias(
    @Query() paginationConvocatoriaDto: PaginationConvocatoriaDto,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean = estado === 'false' ? false : true;
    return this.convocatoriaService.findAllConvocatorias(paginationConvocatoriaDto, estadoBoolean);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una convocatoria por ID',
    description: 'Retorna los detalles de una convocatoria específica'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la convocatoria',
    example: 1
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: String,
    description: 'Filtrar por estado (true/false). Por defecto: true',
    example: 'true'
  })
  @ApiResponse({
    status: 200,
    description: 'Convocatoria encontrada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Convocatoria no encontrada'
  })
  findOneConvocatoriaById(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean = estado === 'false' ? false : true;
    return this.convocatoriaService.findOneConvocatoriaById(id, estadoBoolean);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva convocatoria',
    description: 'Crea una nueva convocatoria con los datos proporcionados'
  })
  @ApiBody({
    type: CreateConvocatoriaDto,
    description: 'Datos de la convocatoria a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Convocatoria creada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  createConvocatoria(
    @Body() createConvocatoriaDto: CreateConvocatoriaDto
  ) {
    return this.convocatoriaService.createConvocatoria(createConvocatoriaDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una convocatoria',
    description: 'Actualiza completamente una convocatoria existente'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la convocatoria a actualizar',
    example: 1
  })
  @ApiBody({
    type: UpdateConvocatoriaDto,
    description: 'Datos actualizados de la convocatoria'
  })
  @ApiResponse({
    status: 200,
    description: 'Convocatoria actualizada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Convocatoria no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  updateConvocatoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConvocatoriaDto: UpdateConvocatoriaDto
  ) {
    return this.convocatoriaService.updateConvocatoria(id, updateConvocatoriaDto);
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Eliminar (desactivar) una convocatoria',
    description: 'Realiza una eliminación lógica de la convocatoria (soft delete)'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la convocatoria a eliminar',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Convocatoria eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Convocatoria no encontrada'
  })
  removeConvocatoria(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.convocatoriaService.removeConvocatoria(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar una convocatoria',
    description: 'Restaura una convocatoria previamente eliminada'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la convocatoria a restaurar',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Convocatoria restaurada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Convocatoria no encontrada'
  })
  restoreConvocatoria(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.convocatoriaService.restoreConvocatoria(id)
  }

  //Apis Extras

  @Post(":id/postular")
  @ApiOperation({
    summary: 'Crear una nueva postulación',
    description: 'Crea una nueva postulación y la asocia a una convocatoria.',
  })
  @ApiBody({
    type: CreatePostulacionDto,
    description: 'Datos necesarios para crear una postulación',
  })
  @ApiResponse({
    status: 201,
    description: 'Postulación creada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o convocatoria no existe',
  })
  convocatoriaPostular(
    @Param("id", ParseIntPipe) id: number,
    @Body() createPostulacionDto: CreatePostulacionDto
  ) {
    return this.convocatoriaService.convocatoriaPostular(id, createPostulacionDto)
  }

   @Get(":id/postulacion")
    @ApiOperation({
      summary: 'Obtener postulaciones de un área',
      description: 'Retorna la lista de postulaciones asociados a una convocatoria.',
    })
    @ApiParam({
      name: 'id',
      type: Number,
      description: 'ID de la convocatoria',
      example: 5,
    })
    @ApiResponse({
      status: 200,
      description: 'Lista de postulaciones obtenida exitosamente',
    })
    @ApiResponse({
      status: 404,
      description: 'Convocatoria no encontrada',
    })
    obtenerPostulacionesConvocatorias(
      @Param("id", ParseIntPipe) id: number,
      @Query() paginationDto: PaginationDto,
      @Query("estado", ParseBoolPipe) estado: boolean
    ) {
      const estadoActual = estado ?? true
      return this.convocatoriaService.obtenerPostulacionesConvocatorias(id, estadoActual, paginationDto)
    }

}