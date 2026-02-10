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
import { PostulacionService } from './postulacion.service';
import { PaginationDto } from 'src/common';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('postulantes')
export class PostulacionController {
  constructor(private readonly postulacionService: PostulacionService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las postulaciones',
    description:
      'Retorna una lista paginada de postulaciones. Se puede filtrar por estado y por estado de postulación.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: Boolean,
    description:
      'Filtrar por estado del registro (true/false). Por defecto: true',
    example: true,
  })
  @ApiQuery({
    name: 'estadoPostulacion',
    required: false,
    type: String,
    description:
      'Filtrar por estado de postulación (PENDIENTE, REVISADO, PRESELECCIONADO, NO_APTO, APROBADO)',
    example: 'PENDIENTE',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de postulaciones obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllPostulaciones(
    @Query() paginationDto: PaginationDto,
    @Query('estado', ParseBoolPipe) estado: boolean,
    @Query('estadoPostulacion') estadoPostulacion?: string,
  ) {
    const estadoValidado = estado ?? true;
    return this.postulacionService.findAllPostulaciones(
      paginationDto,
      estadoValidado,
      estadoPostulacion,
    );
  }

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

  @Post()
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
  createPostulacion(@Body() createPostulacionDto: CreatePostulacionDto) {
    return this.postulacionService.createPostulacion(createPostulacionDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una postulación',
    description: 'Actualiza la información de una postulación existente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la postulación a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdatePostulacionDto,
    description: 'Datos que se pueden actualizar de la postulación',
  })
  @ApiResponse({
    status: 200,
    description: 'Postulación actualizada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada',
  })
  updatePostulacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostulacionDto: UpdatePostulacionDto,
  ) {
    return this.postulacionService.updatePostulacion(id, updatePostulacionDto);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar postulación',
    description: 'Restaura una postulación que fue desactivada previamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la postulación a restaurar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Postulación restaurada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada',
  })
  restorePostulacion(@Param('id', ParseIntPipe) id: number) {
    return this.postulacionService.restorePostulacion(id);
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

@Controller('convocatoria/:convocatoriaId/postular')
export class PostulacionConvocatoriaController {
  constructor(private readonly postulacionService: PostulacionService) {}

  @Post()
  @ApiOperation({
    summary: 'Postular a una convocatoria específica',
    description:
      'Crea una postulación directamente para una convocatoria especificada en la URL.',
  })
  @ApiParam({
    name: 'convocatoriaId',
    type: Number,
    description: 'ID de la convocatoria',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dni: {
          type: 'string',
          description: 'DNI del postulante',
          example: '74859632',
        },
        nombres: {
          type: 'string',
          description: 'Nombres del postulante',
          example: 'Juan Carlos',
        },
        apellidos: {
          type: 'string',
          description: 'Apellidos del postulante',
          example: 'Pérez García',
        },
        telefono: {
          type: 'string',
          description: 'Teléfono del postulante',
          example: '987654321',
        },
        whatsapp: {
          type: 'string',
          description: 'WhatsApp del postulante',
          example: '987654321',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del postulante',
          example: 'juan.perez@email.com',
        },
        experiencia: {
          type: 'string',
          description: 'Experiencia del postulante',
          example: '3 años en desarrollo web',
        },
        motivo: {
          type: 'string',
          description: 'Motivo de postulación',
          example: 'Interés en crecer profesionalmente',
        },
        cv_pdf: {
          type: 'string',
          description: 'Ruta del CV PDF',
          example: 'cv_juanperez_20240115.pdf',
        },
        estado: {
          type: 'string',
          enum: [
            'PENDIENTE',
            'REVISADO',
            'PRESELECCIONADO',
            'NO_APTO',
            'APROBADO',
          ],
          description: 'Estado de la postulación',
          example: 'PENDIENTE',
        },
        puntaje: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Puntaje (0-100)',
          example: 85,
        },
      },
      required: ['dni', 'nombres', 'apellidos', 'email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Postulación creada correctamente para la convocatoria',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o convocatoria no existe',
  })
  postularAConvocatoria(
    @Param('convocatoriaId', ParseIntPipe) convocatoriaId: number,
    @Body() createPostulacionDto: Omit<CreatePostulacionDto, 'convocatoria_id'>,
  ) {
    return this.postulacionService.createPostulacionParaConvocatoria(
      convocatoriaId,
      createPostulacionDto,
    );
  }
}
