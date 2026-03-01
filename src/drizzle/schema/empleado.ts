import { integer, pgEnum, pgTable, varchar, timestamp, boolean, check } from "drizzle-orm/pg-core";
import { UsuarioTable } from "./usuario";
import { AreaTable } from "./area";
import { sql } from "drizzle-orm";

export const DocumentoEnum = pgEnum("tipo_documento", ["dni", "carnet_extranjeria"])
export const TipoPersonalEnum = pgEnum("tipo_personal", ["PLANILLA", "PRACTICANTE"])
export const EstadoLegajoEnum = pgEnum("estado_legajo", ["al_dia", "pendiente", "observado"])

export const EmpleadoTable = pgTable("empleado",{
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  usuario_id: integer("usuario_id").references(()=> UsuarioTable.id).notNull(),
  area_id: integer("area_id").references(()=> AreaTable.id).notNull(),
  nombres: varchar("nombres", {length: 100}).notNull(),
  apellidos: varchar("apellidos", {length: 100}).notNull(),
  tipo_documento: DocumentoEnum().notNull(),
  numero_documento: varchar("numero_documento", {length: 12}).unique().notNull(),
  cargo: varchar("cargo", {length: 100}).notNull(),
  tipo_personal: TipoPersonalEnum().notNull(),
  fecha_ingreso: timestamp("fecha_ingreso").notNull(),
  fecha_nacimiento: timestamp("fecha_nacimiento").notNull(),
  telefono: varchar("telefono", {length: 9}).notNull(),
  email_corporativo: varchar("email_corporativo", {length: 100}).notNull(),
  direccion: varchar("direccion", {length: 255}).notNull(),
  distrito: varchar("distrito", {length: 100}).notNull(),
  estado_legajo: EstadoLegajoEnum().default("pendiente"),
  auditoria_progreso: integer("auditoria_progreso"),
  estado_registro: boolean("estado_registro").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(()=> new Date()).notNull(),
}, (table)=> [
  check("auditoria_progreso_check", sql`(${table.auditoria_progreso} >= 0) and (${table.auditoria_progreso} <=100)`)
])