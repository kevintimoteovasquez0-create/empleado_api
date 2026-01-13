import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { envs } from '../config';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private db: NodePgDatabase;

  async onModuleInit() {

    console.log('Conectando a la base de datos...');

    this.pool = new Pool({
      connectionString: envs.dataBaseUrl,
    });

    try {
      const client = await this.pool.connect(); // obtiene un cliente
      console.log('PostgreSQL conectado correctamente');
      client.release(); // libera inmediatamente el cliente
    } catch (err) {
      console.error('Error de conexión a PostgreSQL:', err);
      process.exit(1);
    }

    this.db = drizzle({ client: this.pool });
  }

  getDb(): NodePgDatabase {
    return this.db;
  }

  async onModuleDestroy() {
    console.log('Cerrando conexión de PostgreSQL...');
    await this.pool.end();
    console.log('Conexión cerrada correctamente');
  }
}