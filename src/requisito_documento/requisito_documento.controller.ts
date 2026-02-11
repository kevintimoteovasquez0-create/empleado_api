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
  Query 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { RequisitoDocumentoService } from './requisito_documento.service';
import { PaginationDto } from 'src/common';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';

@ApiTags('Requisito Documento')
@Controller('requisito-documento')
export class RequisitoDocumentoController {
  constructor(private readonly requisitoDocumentoService: RequisitoDocumentoService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los requisitos de documentos',
    description: 'Retorna una lista paginada de requisitos de documentos. Se puede filtrar por estado.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: String,
    description: 'Filtrar por estado (true/false). Por defecto: true',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de requisitos de documentos obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  findAllRequisitoDocumentos(
    @Query() paginationDto: PaginationDto,
    @Query('estado') estado?: string,
  ) {
    const estadoBoolean = estado === 'false' ? false : true;
    return this.requisitoDocumentoService.findAllRequisitoDocumentos(paginationDto, estadoBoolean);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un requisito de documento por ID',
    description: 'Retorna los detalles de un requisito de documento específico',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del requisito de documento',
    example: 1,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    type: String,
    description: 'Filtrar por estado (true/false). Por defecto: true',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Requisito de documento encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisito de documento no encontrado',
  })
  findRequisitoDocumentoById(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado',ParseBoolPipe) estado: boolean,
  ) {
     const estadoBoolean = estado ?? true

    return this.requisitoDocumentoService.findRequisitoDocumentoById(id, estadoBoolean);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo requisito de documento',
    description: 'Crea un nuevo requisito de documento con los datos proporcionados',
  })
  @ApiBody({
    type: CreateRequisitoDocumentoDto,
    description: 'Datos del requisito de documento a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Requisito de documento creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o orden de visualización duplicado',
  })
  createRequisitoDocumento(
    @Body() createRequisitoDocumentoDto: CreateRequisitoDocumentoDto,
  ) {
    return this.requisitoDocumentoService.createRequisitoDocumento(createRequisitoDocumentoDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un requisito de documento',
    description: 'Actualiza completamente un requisito de documento existente',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del requisito de documento a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateRequisitoDocumentoDto,
    description: 'Datos actualizados del requisito de documento',
  })
  @ApiResponse({
    status: 200,
    description: 'Requisito de documento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisito de documento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o orden de visualización duplicado',
  })
  updateRequisitoDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto,
  ) {
    return this.requisitoDocumentoService.updateRequisitoDocumento(id, updateRequisitoDocumentoDto);
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Eliminar (desactivar) un requisito de documento',
    description: 'Realiza una eliminación lógica del requisito de documento (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del requisito de documento a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisito de documento eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisito de documento no encontrado',
  })
  removeRequisitoDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.requisitoDocumentoService.removeRequisitoDocumento(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar un requisito de documento',
    description: 'Restaura un requisito de documento previamente eliminado',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del requisito de documento a restaurar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisito de documento restaurado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisito de documento no encontrado',
  })
  restoreRequisitoDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.requisitoDocumentoService.restoreRequisitoDocumento(id);
  }
}