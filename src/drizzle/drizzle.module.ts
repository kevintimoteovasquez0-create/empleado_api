import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

// Se agrega decorador @Global() para que el módulo esté disponible en toda la aplicación
@Global()
@Module({
  providers: [DrizzleService],
  // Se asegura que DrizzleService esté exportado para que otros módulos puedan inyectarlo
  exports: [DrizzleService],
})
export class DrizzleModule {}
