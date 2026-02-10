import {
  pgEnum,
  pgTable,
  integer,
  date,
  text,
  decimal,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { EmpleadoTable } from './empleado';

export const ModalidadContratoEnum = pgEnum('modalidad_contrato', [
  'CONVENIO_PRACTICAS',
  'PLAZO_FIJO',
  'INDETERMINADO',
]);

export const MonedaEnum = pgEnum('moneda', ['PEN', 'USD']);

export const EstadoContratoEnum = pgEnum('estado_contrato', [
  'ACTIVO',
  'VENCIDO',
  'RENOVADO',
  'TERMINADO',
]);

export const contrato = pgTable('contrato', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  empleado_id: integer('empleado_id')
    .references(() => EmpleadoTable.id)
    .notNull(),
  modalidad: ModalidadContratoEnum().notNull(),
  fecha_inicio: date('fecha_inicio').notNull(),
  fecha_fin: date('fecha_fin'),
  archivo_pdf: text('archivo_pdf'),
  sueldo_bruto: decimal('sueldo_bruto', { precision: 10, scale: 2 }).notNull(),
  moneda: MonedaEnum().notNull(),
  estado: EstadoContratoEnum().notNull(),
  observaciones: text('observaciones'),
  estado_registro: boolean('estado_registro').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
