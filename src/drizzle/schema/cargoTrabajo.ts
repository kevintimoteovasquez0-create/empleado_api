import { integer, timestamp, varchar, pgTable, boolean } from "drizzle-orm/pg-core";

export const CargoTrabajoTable = pgTable("cargoTrabajo", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar('nombre', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', {length: 150}).notNull(),
    estadoRegistro: boolean('estado_registro').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date).notNull()
})