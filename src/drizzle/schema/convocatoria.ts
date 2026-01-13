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
    cargoId: integer('cargo_id').references(() => CargoTrabajoTable.id).notNull(),
    usuarioId: integer('usuario_id').references(() => UsuarioTable.id).notNull(),
    areaId: integer('area_id').references(() => AreaTrabajoTable.id).notNull(),
    tipoEmpleado: TipoEmpleado('tipo_empleado').notNull(),
    remuneracion: decimal('remuneracion', { precision: 10, scale: 2 }).notNull(),
    esAConvenir: boolean('es_a_convenir').default(false).notNull(),
    responsableId: integer('responsable_id').references(() => UsuarioTable.id).notNull(),
    estadoRegistro: boolean('estado_registro').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull()
})