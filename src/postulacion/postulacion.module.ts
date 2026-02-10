import { Module } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import {
  PostulacionController,
  PostulacionConvocatoriaController,
} from './postulacion.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [PostulacionController, PostulacionConvocatoriaController],
  providers: [PostulacionService],
  exports: [PostulacionService],
})
export class PostulacionModule {}
