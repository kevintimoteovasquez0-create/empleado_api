import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { RolTable } from "./rol";
import { AccesoTable } from "./acceso";

export const Rol_Acceso_Table = pgTable("rol_acceso", {
  rolId: integer("rol_id").references(() => RolTable.id).notNull(),
  accesoId: integer("acceso_id").references(() => AccesoTable.id).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.rolId, table.accesoId] })
  ]
);