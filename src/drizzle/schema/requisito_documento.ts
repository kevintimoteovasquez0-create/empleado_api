import { pgTable, integer, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const AplicaParaEnum = pgEnum("aplica_para", [
  "PLANILLA",
  "PRACTICANTE",
  "AMBOS"
]);

export const RequisitoDocumentoTable = pgTable('requisito_documento', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }).notNull(),
  es_obligatorio: boolean('es_obligatorio').default(false).notNull(),
  aplica_para: AplicaParaEnum().notNull(),
  orden_visualizacion: integer('orden_visualizacion').notNull(),
  estado_registro: boolean('estado_registro').default(true).notNull(),
  created_at: timestamp('createdAt').defaultNow().notNull(),
  updated_at: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull() 
});