import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { AccesoTable } from '../drizzle/schema/acceso';

@Injectable()
export class AccesoService {
  constructor(private readonly drizzleService: DrizzleService) {}

  // Visualizar todos los accesos
  async findAllAccesos() {
    try {
      // Usamos getDb() porque tu propiedad 'db' es privada en el servicio
      const db = this.drizzleService.getDb();

      const accesos = await db.select().from(AccesoTable);

      return {
        data: accesos,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrio un error con el sistema: ${error}`,
      );
    }
  }
}
