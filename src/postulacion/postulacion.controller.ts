import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateEstadoPostulacionDto} from './dto/update-estado-postulacion.dto';

@ApiTags('Postulacion')
@Controller('postulacion')
export class PostulacionController {
  constructor(private readonly postulacionService: PostulacionService) { }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener postulación por ID',
    description:
      'Retorna la información de una postulación específica según su ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la postulación',
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
    description: 'Postulación obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada',
  })
  findPostulacionById(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado', ParseBoolPipe) estado: boolean,
  ) {
    const estadoValidado = estado ?? true;
    return this.postulacionService.findPostulacionById(id, estadoValidado);
  }

  @Patch(':id/evaluacion')
  @ApiOperation({
    summary: 'Evaluar postulación',
    description: 'Cambia el estado de la postulación como parte del proceso de evaluación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la postulación',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Postulación evaluada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada',
  })
  evaluarEstadoPostulacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoPostulacionDto: UpdateEstadoPostulacionDto
  ) {
    return this.postulacionService.evaluarEstadoPostulacion(id, updateEstadoPostulacionDto);
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Eliminar postulación',
    description: 'Desactiva (soft delete) una postulación del sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la postulación a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Postulación eliminada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada',
  })
  removePostulacion(@Param('id', ParseIntPipe) id: number) {
    return this.postulacionService.removePostulacion(id);
  }
}
