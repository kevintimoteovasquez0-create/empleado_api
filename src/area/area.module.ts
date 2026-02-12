import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { EmpleadoModule } from 'src/empleado/empleado.module';
import { PostulacionModule } from 'src/postulacion/postulacion.module';

@Module({
  imports: [DrizzleModule, EmpleadoModule, PostulacionModule],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
