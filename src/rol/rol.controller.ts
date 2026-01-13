import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  ParseIntPipe,
  Patch,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PaginationDto } from 'src/common';

@ApiTags('ROL')
@ApiBearerAuth()
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  // 🔹 Lista de roles
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Obtiene una lista paginada de roles según su estado.'
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'estado',
    required: false,
    example: 'true',
    description: 'Estado del rol (true = activos, false = eliminados)'
  })
  findAllRol(
    @Query() paginationDto: PaginationDto,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean: boolean = estado === 'false' ? false : true;
    return this.rolService.findAllRol(paginationDto, estadoBoolean);
  }

  // 🔹 Obtener un rol por ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene un rol específico según su ID y estado.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID del rol'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    example: 'true'
  })
  findOneRol(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean: boolean = estado === 'false' ? false : true;
    return this.rolService.findOneRol(id, estadoBoolean);
  }

  // 🔹 Crear rol
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un rol con sus accesos asociados.'
  })
  @ApiBody({ type: CreateRolDto })
  createRol(@Body() createRolDto: CreateRolDto) {
    return this.rolService.createRol(createRolDto);
  }

  // 🔹 Actualizar rol
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza la información de un rol existente.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateRolDto })
  updateRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto
  ) {
    return this.rolService.updateRol(id, updateRolDto);
  }

  // 🔹 Restaurar rol
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar rol',
    description: 'Restaura un rol eliminado lógicamente.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  restaurarRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.restaurarRol(id);
  }

  // 🔹 Eliminar rol
  @Patch(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar rol',
    description: 'Elimina un rol de forma lógica.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.remove(id);
  }
}
