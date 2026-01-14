import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const AccesoTable = pgTable('acceso', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    path: varchar('nombre', { length: 40 }).notNull(),
    descripcion: varchar('descripcion', { length: 150 }).notNull(),
    estado_registro: boolean('estado_registro').default(true).notNull(),
    created_at: timestamp('createdAt').defaultNow().notNull(),
    updated_at: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull()
})