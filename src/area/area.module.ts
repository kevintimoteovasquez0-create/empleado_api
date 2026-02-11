import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { EmpleadoModule } from 'src/empleado/empleado.module';
import { PostulacionService } from 'src/postulacion/postulacion.service';

@Module({
  imports: [DrizzleModule, EmpleadoModule, PostulacionService],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
