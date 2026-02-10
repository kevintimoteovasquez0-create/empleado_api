import {
  pgEnum,
  pgTable,
  integer,
  varchar,
  text,
  date,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { EmpleadoTable } from './empleado';
import { UsuarioTable } from './usuario';

export const TipoLicenciaEnum = pgEnum('tipo_licencia', [
  'DESCANSO_MEDICO',
  'LICENCIA_MATERNIDAD',
  'LICENCIA_PATERNIDAD',
]);

export const EstadoLicenciaEnum = pgEnum('estado_licencia', [
  'PENDIENTE',
  'APROBADO',
  'RECHAZADO',
]);

export const licencia_medica = pgTable('licencia_medica', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  empleado_id: integer('empleado_id')
    .references(() => EmpleadoTable.id)
    .notNull(),
  tipo: TipoLicenciaEnum().notNull(),
  diagnostico_cie10: varchar('diagnostico_cie10', { length: 100 }),
  doctor_tratante: varchar('doctor_tratante', { length: 150 }),
  cmp: varchar('cmp', { length: 20 }),
  archivo_sustento_pdf: text('archivo_sustento_pdf'),
  fecha_inicio: date('fecha_inicio').notNull(),
  dias_descanso: integer('dias_descanso').notNull(),
  estado: EstadoLicenciaEnum().default('PENDIENTE').notNull(),
  revisado_por: integer('revisado_por').references(() => UsuarioTable.id),
  estado_registro: boolean('estado_registro').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
