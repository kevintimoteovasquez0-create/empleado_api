import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccesoService {
  constructor(private readonly prisma: PrismaService) {}

  // Visualizar todos los accesos
  async findAllAccesos() {
    try {
      const accesos = await this.prisma.acceso.findMany();
      return {
        data: accesos
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ocurrio un error con el sistema: ${error}`,
      );
    }
  }
}
