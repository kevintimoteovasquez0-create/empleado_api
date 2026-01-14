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
      max: 30,
      idleTimeoutMillis: 60000, //1 minuto
      connectionTimeoutMillis: 5000, //5 segundos
    });

    this.db = drizzle({ client: this.pool });
  }

  getDb(): NodePgDatabase {
    if (!this.db) {
      throw new Error('Database no inicializada');
    }
    return this.db;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
