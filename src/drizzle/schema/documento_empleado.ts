import {
  pgTable,
  integer,
  text,
  timestamp,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { EmpleadoTable } from './empleado';
import { RequisitoDocumentoTable } from './requisito_documento';
import { UsuarioTable } from './usuario';

// Enums
export const TipoArchivoEnum = pgEnum('tipo_archivo', ['pdf', 'img']);
export const EstadoDocumentoEnum = pgEnum('estado_documento', [
  'PENDIENTE',
  'COMPLETO',
  'OBSERVADO',
]);

export const DocumentoEmpleadoTable = pgTable('documento_empleado', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  empleado_id: integer('empleado_id')
    .references(() => EmpleadoTable.id)
    .notNull(),
  requisito_id: integer('requisito_id')
    .references(() => RequisitoDocumentoTable.id)
    .notNull(),
  archivo_pdf: text('archivo_pdf').notNull(),
  tipo_archivo: TipoArchivoEnum().notNull(),
  estado: EstadoDocumentoEnum().default('PENDIENTE').notNull(),
  observacion_texto: text('observacion_texto'),
  fecha_subida: timestamp('fecha_subida').defaultNow().notNull(),
  revisado_por: integer('revisado_por').references(() => UsuarioTable.id),
  fecha_revision: timestamp('fecha_revision'),
  estado_registro: boolean('estado_registro').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const documentoEmpleadoRelations = relations(
  DocumentoEmpleadoTable,
  ({ one }) => ({
    empleado: one(EmpleadoTable, {
      fields: [DocumentoEmpleadoTable.empleado_id],
      references: [EmpleadoTable.id],
    }),
    requisito: one(RequisitoDocumentoTable, {
      fields: [DocumentoEmpleadoTable.requisito_id],
      references: [RequisitoDocumentoTable.id],
    }),
    revisor: one(UsuarioTable, {
      fields: [DocumentoEmpleadoTable.revisado_por],
      references: [UsuarioTable.id],
    }),
  }),
);
