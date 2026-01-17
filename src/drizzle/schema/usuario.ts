import { pgTable, integer, varchar, boolean, date, timestamp, pgEnum, text } from "drizzle-orm/pg-core";
import { EmpresaTable } from "./empresa";
import { RolTable } from "./rol";

export const TipoDocumentoUsuario = pgEnum('tipo_documento_usuario', [
  "DNI",
  "CE"
]);

export const UsuarioTable = pgTable('usuario', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  rol_id: integer('rol_id')
    .references(() => RolTable.id)
    .notNull(),
  empresa_id: integer('empresa_id')
    .references(() => EmpresaTable.id)
    .notNull(),
  nombre: varchar('nombre', { length: 50 }).notNull(),
  apellido: varchar('apellido', { length: 50 }).notNull(),
  tipo_documento: varchar('tipo_documento', { length: 20 }).notNull(),
  numero_documento: varchar('numero_documento', { length: 20 }).notNull().unique(),
  fecha_nacimiento: date('fecha_nacimiento'),
  fecha_ingreso: date('fecha_ingreso'),
  direccion: varchar('direccion', { length: 255 }),
  pais: varchar('pais', { length: 100 }),
  departamento: varchar('departamento', { length: 100 }),
  provincia: varchar('provincia', { length: 100 }),
  distrito: varchar('distrito', { length: 100 }),
  telefono: varchar('telefono', { length: 9 }),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 60 }).notNull(),
  nombre_imagen: varchar('nombre_imagen'),
  verificado_email: boolean('verificado_email').default(false).notNull(),
  remember_token: varchar('remember_token'),
  token_verificacion_email: varchar('token_verificacion_email', { length: 255 }),
  token_expiry_email: timestamp('token_expiry_email'),
  token_verificacion_password: varchar('token_verificacion_password', { length: 255 }),
  token_expiry_password: timestamp('token_expiry_password'),
  
  // Campos para 2FA con TOTP (Google Authenticator)
  auth_two_factor: boolean('auth_two_factor').default(false).notNull(),
  two_factor_secret: varchar('two_factor_secret', { length: 255 }),

  // Códigos de recuperación para 2FA
  recovery_codes: text('recovery_codes'),
  
  estado_registro: boolean('estado_registro').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
