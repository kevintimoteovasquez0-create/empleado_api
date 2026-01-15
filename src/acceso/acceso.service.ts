import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { AccesoTable } from 'src/drizzle/schema/acceso';

@Injectable()
export class AccesoService {

  constructor(private readonly drizzleService: DrizzleService) {}

  private get db(){
    return this.drizzleService.getDb()
  }

  async findAllAccesos() {
    try {
      const accesos = await this.db.select().from(AccesoTable);
      return { data: accesos };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrió un error con el sistema: ${error}`,
      );
    }
  }
}
