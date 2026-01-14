import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccesoService } from './acceso.service';

@ApiTags('Acceso')
@Controller('acceso')
export class AccesoController {
  constructor(private readonly accesoService: AccesoService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los accesos',
    description: 'Retorna la lista completa de accesos registrados en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de accesos obtenida correctamente',
  })
  findAllAccesos() {
    return this.accesoService.findAllAccesos();
  }
}
