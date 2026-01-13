import { pgTable, integer, varchar, boolean, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { EmpresaTable } from "./empresa";
import { RolTable } from "./rol";

export const TipoDocumentoUsuario = pgEnum('tipo_documento_usuario', [
  "DNI",
  "CE"
]);

export const UsuarioTable = pgTable('usuario', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  rolId: integer("rol_id").references(() => RolTable.id).notNull(),
  empresaId: integer("empresa_id").references(() => EmpresaTable.id).notNull(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  apellido: varchar("apellido", { length: 50 }).notNull(),
  tipoDocumento: TipoDocumentoUsuario("tipo_documento").notNull(),
  numeroDocumento: varchar("numero_documento", { length: 20 }).notNull().unique(),
  fechaNacimiento: date("fecha_nacimiento"),
  fechaIngreso: date("fecha_ingreso"),
  direccion: varchar("direccion", { length: 255 }),
  pais: varchar("pais", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  provincia: varchar("provincia", { length: 100 }),
  distrito: varchar("distrito", { length: 100 }),
  telefono: varchar("telefono", { length: 9 }),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 60 }).notNull(),
  nombreImagen: varchar("nombre_imagen"),
  verificadoEmail: boolean("verificado_email").default(false).notNull(),
  rememberToken: varchar('remember_token'),
  tokenVerificacionEmail: varchar("token_verificacion_email", { length: 255 }),
  tokenExpiryEmail: timestamp("token_expiry_email"),
  tokenVerificacionPassword: varchar("token_verificacion_password", { length: 255 }),
  tokenExpiryPassword: timestamp("token_expiry_password"),
  authTwoFactor: boolean("auth_two_factor").default(false).notNull(),
  twoFactorCode: integer("two_factor_code"),
  twoFactorExpired: timestamp("two_factor_expired"),
  estadoRegistro: boolean("estado_registro").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull()
});