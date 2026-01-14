import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';
import { ReniecService } from './reniec.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AccesoRequerido } from 'src/auth/decorators/acceso.decorator';
import { NumeroDto } from './dto/numero.dto';

@ApiTags('RENIEC')
@ApiBearerAuth()
@Controller('reniec')
export class ReniecController {
  constructor(private readonly reniecService: ReniecService) {}

  @Get(':nrodocumento')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @AccesoRequerido()
  @ApiOperation({
    summary: 'Consultar datos de una persona por número de documento',
    description: 'Obtiene información desde RENIEC usando el número de documento (DNI).'
  })
  @ApiParam({
    name: 'nrodocumento',
    type: String,
    example: '12345678',
    description: 'Número de documento (DNI de 8 dígitos)'
  })
  findDataUsuarioByDocument(
    @Param('nrodocumento') numero: NumeroDto
  ) {
    return this.reniecService.findDataUsuarioByDocument(numero);
  }
}
