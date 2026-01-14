import { Module } from '@nestjs/common';
import { AccesoService } from './acceso.service';
import { AccesoController } from './acceso.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule], // 👈 2. Agrega esto
  controllers: [AccesoController],
  providers: [AccesoService],
})
export class AccesoModule {}
