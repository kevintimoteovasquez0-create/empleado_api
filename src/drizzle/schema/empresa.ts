import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const EmpresaTable = pgTable("empresa", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    razonSocial: varchar("razon_social", { length: 50 }).notNull(),
    ruc: varchar("ruc", { length: 11 }).notNull(),
    estadoRegistro: boolean("estado_registro").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull()
})