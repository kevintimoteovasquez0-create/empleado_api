import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentoEmpleadoService } from './documento_empleado.service';
import { PaginationDto } from 'src/common';
import { CreateDocumentoEmpleadoDto } from './dto/create-documento-empleado.dto';
import { UpdateDocumentoEmpleadoDto } from './dto/update-documento-empleado.dto';

@ApiTags('Documento Empleado')
@Controller('documento-empleado')
export class DocumentoEmpleadoController {
  constructor(
    private readonly documentoEmpleadoService: DocumentoEmpleadoService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los documentos de empleados',
    description:
      'Retorna una lista paginada de documentos de empleados. Se puede filtrar por empleado_id y estado.',
  })
  @ApiQuery({
    name: 'empleado_id',
    required: false,
    type: Number,
    description: 'Filtrar por ID del empleado',
    example: 1,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: String,
    description: 'Filtrar por estado (PENDIENTE, COMPLETO, OBSERVADO)',
    example: 'PENDIENTE',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllDocumentosEmpleado(
    @Query() paginationDto: PaginationDto,
    @Query('empleado_id') empleadoId?: string,
    @Query('estado') estado?: string,
  ) {
    const empleadoIdNumber = empleadoId ? parseInt(empleadoId) : undefined;
    return this.documentoEmpleadoService.findAllDocumentosEmpleado(
      paginationDto,
      empleadoIdNumber,
      estado,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un documento de empleado por ID',
    description:
      'Retorna los detalles de un documento específico con información del requisito',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del documento de empleado',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento no encontrado',
  })
  findDocumentoEmpleadoById(@Param('id', ParseIntPipe) id: number) {
    return this.documentoEmpleadoService.findDocumentoEmpleadoById(id);
  }

  @Get('empleado/:empleadoId')
  @ApiOperation({
    summary: 'Obtener todos los documentos de un empleado',
    description:
      'Retorna todos los documentos asociados a un empleado específico',
  })
  @ApiParam({
    name: 'empleadoId',
    type: Number,
    description: 'ID del empleado',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documentos del empleado obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  findDocumentosByEmpleadoId(
    @Param('empleadoId', ParseIntPipe) empleadoId: number,
  ) {
    return this.documentoEmpleadoService.findDocumentosByEmpleadoId(empleadoId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo documento de empleado',
    description:
      'Crea un nuevo documento de empleado. Valida que el empleado y requisito existan y que no exista ya un documento del mismo requisito para el empleado.',
  })
  @ApiBody({
    type: CreateDocumentoEmpleadoDto,
    description: 'Datos del documento a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Documento creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, empleado/requisito no existe o documento duplicado',
  })
  createDocumentoEmpleado(
    @Body() createDocumentoEmpleadoDto: CreateDocumentoEmpleadoDto,
  ) {
    return this.documentoEmpleadoService.createDocumentoEmpleado(
      createDocumentoEmpleadoDto,
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un documento de empleado',
    description: 'Actualiza completamente un documento de empleado existente',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del documento a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateDocumentoEmpleadoDto,
    description: 'Datos actualizados del documento',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o empleado/requisito no existe',
  })
  updateDocumentoEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoEmpleadoDto: UpdateDocumentoEmpleadoDto,
  ) {
    return this.documentoEmpleadoService.updateDocumentoEmpleado(
      id,
      updateDocumentoEmpleadoDto,
    );
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de un documento',
    description:
      'Actualiza el estado de un documento (PENDIENTE, COMPLETO, OBSERVADO) y opcionalmente agrega observación y revisor',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del documento',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: ['PENDIENTE', 'COMPLETO', 'OBSERVADO'],
          example: 'COMPLETO',
        },
        observacion: {
          type: 'string',
          example: 'Documento aprobado correctamente',
        },
        revisado_por: {
          type: 'number',
          example: 5,
        },
      },
      required: ['estado'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del documento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido',
  })
  cambiarEstadoDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'PENDIENTE' | 'COMPLETO' | 'OBSERVADO',
    @Body('observacion') observacion?: string,
    @Body('revisado_por') revisadoPor?: number,
  ) {
    return this.documentoEmpleadoService.cambiarEstadoDocumento(
      id,
      estado,
      observacion,
      revisadoPor,
    );
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Eliminar (desactivar) un documento de empleado',
    description:
      'Realiza una eliminación lógica del documento de empleado (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del documento de empleado a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documento de empleado eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento de empleado no encontrado',
  })
  removeDocumentoEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.documentoEmpleadoService.removeDocumentoEmpleado(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar un documento de empleado',
    description: 'Restaura un documento de empleado previamente eliminado',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del documento de empleado a restaurar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documento de empleado restaurado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento de empleado no encontrado o ya está activo',
  })
  restoreDocumentoEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.documentoEmpleadoService.restoreDocumentoEmpleado(id);
  }
}
