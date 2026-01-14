import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const EmpresaTable = pgTable("empresa", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    razon_social: varchar("razon_social", { length: 50 }).notNull(),
    ruc: varchar("ruc", { length: 11 }).notNull(),
    estado_registro: boolean("estado_registro").default(true).notNull(),
    created_at: timestamp("createdAt").defaultNow().notNull(),
    updated_at: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull()
})