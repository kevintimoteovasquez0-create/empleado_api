import { decimal, pgEnum, boolean, integer, timestamp, pgTable } from "drizzle-orm/pg-core";
import { CargoTrabajoTable } from "./cargoTrabajo";
import { AreaTrabajoTable } from "./areaTrabajo";
import { UsuarioTable } from "./usuario";

export const TipoEmpleado = pgEnum('tipoEmpleado', [
    'PROF',
    'PRAT'
]);

export const ConvocatoriaTable = pgTable("convocatoria", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    cargo_id: integer('cargo_id').references(() => CargoTrabajoTable.id).notNull(),
    usuario_id: integer('usuario_id').references(() => UsuarioTable.id).notNull(),
    area_id: integer('area_id').references(() => AreaTrabajoTable.id).notNull(),
    tipo_empleado: TipoEmpleado('tipo_empleado').notNull(),
    remuneracion: decimal('remuneracion', { precision: 10, scale: 2 }).notNull(),
    es_a_convenir: boolean('es_a_convenir').default(false).notNull(),
    responsable_id: integer('responsable_id').references(() => UsuarioTable.id).notNull(),
    estado_registro: boolean('estado_registro').default(true).notNull(),
    created_at: timestamp('createdAt').defaultNow().notNull(),
    updated_at: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull()
})