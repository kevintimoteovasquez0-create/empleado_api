import { Module } from '@nestjs/common';
import { RequisitoDocumentoService } from './requisito_documento.service';
import { RequisitoDocumentoController } from './requisito_documento.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [RequisitoDocumentoController],
  providers: [RequisitoDocumentoService],
  exports: [RequisitoDocumentoService],
})
export class RequisitoDocumentoModule {}