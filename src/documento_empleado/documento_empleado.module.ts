import { Module } from '@nestjs/common';
import { DocumentoEmpleadoService } from './documento_empleado.service';
import { DocumentoEmpleadoController } from './documento_empleado.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RequisitoDocumentoModule } from 'src/requisito_documento/requisito_documento.module';

@Module({
  imports: [DrizzleModule, RequisitoDocumentoModule],
  controllers: [DocumentoEmpleadoController],
  providers: [DocumentoEmpleadoService],
  exports: [DocumentoEmpleadoService],
})
export class DocumentoEmpleadoModule {}
