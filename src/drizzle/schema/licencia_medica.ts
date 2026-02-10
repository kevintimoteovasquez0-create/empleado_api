import { integer, pgEnum, pgTable, varchar, timestamp, text, boolean, check } from "drizzle-orm/pg-core";
import { UsuarioTable } from "./usuario";
import { EmpleadoTable } from "./empleado";
import { sql } from "drizzle-orm";

export const TipoLicenciaEnum = pgEnum("tipo_licencia", [
  "descanso_medico",
  "licencia_maternidad",
  "licencia_paternidad"
]);

export const EstadoLicenciaEnum = pgEnum("estado_licencia", [
  "pendiente",
  "aprobado",
  "rechazado"
]);

export const LicenciaMedicaTable = pgTable("licencia_medica", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  empleado_id: integer("empleado_id").references(() => EmpleadoTable.id).notNull(),
  tipo: TipoLicenciaEnum().notNull(),
  diagnostico_cie10: varchar("diagnostico_cie10", { length: 100 }).notNull(),
  doctor_tratante: varchar("doctor_tratante", { length: 150 }).notNull(),
  cmp: varchar("cmp", { length: 20 }).notNull(),
  archivo_sustento_pdf: text("archivo_sustento_pdf").notNull(),
  fecha_inicio: timestamp("fecha_inicio").notNull(),
  dias_descanso: integer("dias_descanso").notNull(),
  estado: EstadoLicenciaEnum().default("pendiente"),
  revisado_por: integer("revisado_por").references(() => UsuarioTable.id),
  fecha_revision: timestamp("fecha_revision"),
  observaciones: text("observaciones"),
  estado_registro: boolean("estado_registro").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  check("dias_descanso_check", sql`${table.dias_descanso} > 0`)
]);
