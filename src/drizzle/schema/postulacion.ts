import {
  pgEnum,
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { ConvocatoriaTable } from './convocatoria';

export const EstadoPostulacionEnum = pgEnum('estado_postulacion', [
  'PENDIENTE',
  'REVISADO',
  'PRESELECCIONADO',
  'NO_APTO',
  'APROBADO',
]);

export const postulacion = pgTable('postulacion', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  convocatoria_id: integer('convocatoria_id')
    .references(() => ConvocatoriaTable.id)
    .notNull(),
  dni: varchar('dni', { length: 20 }).notNull(),
  nombres: varchar('nombres', { length: 100 }).notNull(),
  apellidos: varchar('apellidos', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  email: varchar('email', { length: 100 }).notNull(),
  experiencia: varchar('experiencia', { length: 50 }),
  motivo: text('motivo'),
  cv_pdf: text('cv_pdf'),
  estado: EstadoPostulacionEnum().default('PENDIENTE').notNull(),
  puntaje: integer('puntaje').default(0),
  estado_registro: boolean('estado_registro').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
