import { Module } from '@nestjs/common';
import { ConvocatoriaService } from './convocatoria.service';
import { ConvocatoriaController } from './convocatoria.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { PostulacionModule } from 'src/postulacion/postulacion.module';

@Module({
  imports: [DrizzleModule, PostulacionModule],
  controllers: [ConvocatoriaController],
  providers: [ConvocatoriaService],
})
export class ConvocatoriaModule {}
