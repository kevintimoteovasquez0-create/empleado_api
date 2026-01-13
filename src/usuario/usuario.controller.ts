import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationUsuarioDto } from './dto/pagination-usuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthRequest } from '../auth/interfaces/auth-request';
import { TipoDocumentoUsuarioList } from './enum/usuario.enum';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get(':id/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener perfil de usuario',
    description: 'Obtiene el perfil completo de un usuario por ID.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  findUsuarioById(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findUniqueUsuario(id, true);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene un listado paginado de usuarios.'
  })
  @ApiQuery({ name: 'estado', required: false, example: 'true' })
  getAllUsuario(
    @Query() paginationUsuarioDto: PaginationUsuarioDto,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean = estado === 'false' ? false : true;
    return this.usuarioService.getAllUsuario(
      paginationUsuarioDto,
      estadoBoolean
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuario',
    description: 'Obtiene la información de un usuario por ID.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiQuery({ name: 'estado', required: false, example: 'true' })
  findUniqueUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('estado') estado?: string
  ) {
    const estadoBoolean = estado === 'false' ? false : true;
    return this.usuarioService.findUniqueUsuario(id, estadoBoolean);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('fotoUsuario', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
        const extension = file.mimetype.split('/')[1].toLowerCase();

        if (!extensionesPermitidas.includes(extension)) {
          return cb(
            new BadRequestException(
              `Formato de imagen no permitido. Solo se permiten: ${extensionesPermitidas.join(', ')}`
            ),
            false
          );
        }
        cb(null, true);
      }
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un usuario con foto opcional.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rol_id: { type: 'integer', example: 1 },
        nombre: { type: 'string', example: 'Juan' },
        apellido: { type: 'string', example: 'Pérez' },
        tipo_documento: {
          type: 'string',
          enum: TipoDocumentoUsuarioList
        },
        numero_documento: { type: 'string', example: '12345678' },
        fecha_nacimiento: { type: 'string', format: 'date-time' },
        fecha_ingreso: { type: 'string', format: 'date-time' },
        direccion: { type: 'string' },
        pais: { type: 'string' },
        departamento: { type: 'string' },
        provincia: { type: 'string' },
        distrito: { type: 'string' },
        telefono: { type: 'string', example: '987654321' },
        email: { type: 'string', format: 'email' },
        fotoUsuario: { type: 'string', format: 'binary' }
      }
    }
  })
  createUsuario(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() fotoUsuario: Express.Multer.File,
    @Req() req: AuthRequest
  ) {
    const empresaId = req.user.empresa_id;
    return this.usuarioService.createUsuario(
      createUsuarioDto,
      fotoUsuario,
      empresaId
    );
  }

  @Put('actualizar-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar contraseña',
    description: 'Actualiza la contraseña del usuario autenticado.'
  })
  updatePasswordProfile(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const usuarioId = req.user.id;
    return this.usuarioService.updatePasswordProfile(
      usuarioId,
      updatePasswordDto
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiConsumes('multipart/form-data')
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @UploadedFile() fotoUsuario: Express.Multer.File,
    @Req() req: AuthRequest
  ) {
    const empresaId = req.user.empresa_id;
    return this.usuarioService.updateUsuario(
      id,
      updateUsuarioDto,
      empresaId,
      fotoUsuario
    );
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar usuario',
    description: 'Restaura un usuario eliminado.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  restaurarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.restaurarUsuario(id);
  }

  @Patch(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Envía un usuario a la papelera.'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}