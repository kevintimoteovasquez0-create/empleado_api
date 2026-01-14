import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { RolTable } from "./rol";
import { AccesoTable } from "./acceso";

export const Rol_Acceso_Table = pgTable("rol_acceso", {
  rol_id: integer("rol_id").references(() => RolTable.id).notNull(),
  acceso_id: integer("acceso_id").references(() => AccesoTable.id).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.rol_id, table.acceso_id] })
  ]
);