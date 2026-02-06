import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { UsuarioTable } from "./usuario";

export const AreaTable = pgTable('area', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar('nombre', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', { length: 150 }).notNull(),
    responsable_id: integer("responsable_id").references(()=> UsuarioTable.id),
    estado_registro: boolean('estado_registro').default(true).notNull(),
    created_at: timestamp('createdAt').defaultNow().notNull(),
    updated_at: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull()
})