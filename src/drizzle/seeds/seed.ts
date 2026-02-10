import * as bcrypt from 'bcryptjs';
import { RolTable } from '../schema/rol';
import { EmpresaTable } from '../schema/empresa';
import { AccesoTable } from '../schema/acceso';
import { Rol_Acceso_Table } from '../schema/rol_acceso';
import { UsuarioTable } from '../schema/usuario';
import { DrizzleService } from '../drizzle.service';
import { AreaTable } from '../schema/area';
import { eq } from 'drizzle-orm';
import { EmpleadoTable } from '../schema/empleado';

async function main() {

  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();
  const db = drizzleService.getDb();

  try {

    const [adminRole] = await db.insert(RolTable).values({
      nombre: "GERENTE 1",
      descripcion: "ES GERENTE 1"
    }).returning();

    const [adminRoleSegundo] = await db.insert(RolTable).values({
      nombre: "GERENTE 2",
      descripcion: "ES GERENTE 2"
    }).returning();

    const [empresa] = await db.insert(EmpresaTable).values({
      razon_social: "Empresa de carnes",
      ruc: "12345678911"
    }).returning();

    const areaTrabajo = await db.insert(AreaTable).values({
      nombre: 'Gerente General',
      descripcion: 'Es gerente general',
      responsable_id: null
    }).returning();
    const responseAreaTrabajo = areaTrabajo[0]

    await db.insert(AccesoTable).values([
      { path: "local", descripcion: "1" },
      { path: "proveedor", descripcion: "1" },
      { path: "producto", descripcion: "1" },
      { path: "insumo", descripcion: "1" },
      { path: "insumo_extra", descripcion: "1" },
      { path: "empleado", descripcion: "1" },
      { path: "pedido", descripcion: "1" },
      { path: "delivery", descripcion: "1" },
      { path: "estadisticas", descripcion: "1" },
    ]);


    // Obtener todos los accesos creados
    const accesos = await db.select().from(AccesoTable);

    // Crear las relaciones en la tabla intermedia "rol_acceso"
    await db.insert(Rol_Acceso_Table).values(
      accesos.map((acceso) => ({
        rol_id: adminRole.id,
        acceso_id: acceso.id,
      }))
    );

    await db.insert(Rol_Acceso_Table).values(
      accesos.map((acceso) => ({
        rol_id: adminRoleSegundo.id,
        acceso_id: acceso.id,
      }))
    );

    const hashedPassword = await bcrypt.hash('Prueb@123', 10);

    const usuarioData = {
      nombre: 'usuario',
      apellido: 'apellidousuario',
      tipo_documento: "DNI" as const,
      numero_documento: '78945612',
      fecha_nacimiento: new Date('1990-01-01').toISOString(),
      fecha_ingreso: new Date().toISOString(),
      direccion: 'Av. Siempre Viva 742',
      pais: 'Perú',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      telefono: '987654321',
      email: 'empresoftperu@gmail.com',
      password: hashedPassword,
      rol_id: adminRole.id,
      empresa_id: empresa.id,
      area_id: responseAreaTrabajo.id,
      nombre_imagen: 'empresoft.jpg',
      verificado_email: true,
    };

    const usuarioDataDos = {
      nombre: 'Carlos',
      apellido: 'Ramírez Torres',
      tipo_documento: "DNI" as const,
      numero_documento: '45612378',
      fecha_nacimiento: new Date('1992-06-15').toISOString(),
      fecha_ingreso: new Date().toISOString(),
      direccion: 'Calle Los Olivos 123',
      pais: 'Perú',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'San Isidro',
      telefono: '956123789',
      email: 'leonsaavedrajosefabian573@gmail.com',
      password: hashedPassword,
      rol_id: adminRoleSegundo.id,
      empresa_id: empresa.id,
      area_id: responseAreaTrabajo.id,
      nombre_imagen: 'empresoft.jpg',
      verificado_email: true,
    };

    // Creación en Prisma
    const [usuarioAdmin] = await db.insert(UsuarioTable).values(usuarioData).returning() as any[];
    await db.insert(UsuarioTable).values(usuarioDataDos);

    const [area] = await db.update(AreaTable)
      .set({ responsable_id: usuarioAdmin.id })
      .where(eq(AreaTable.id, responseAreaTrabajo.id)).returning();

    await db
      .insert(EmpleadoTable)
      .values({
        usuario_id: usuarioAdmin.id,
        area_id: area.id,
        nombres: 'Juan Carlos',
        apellidos: 'Pérez Gómez',
        tipo_documento: 'dni',
        numero_documento: '87654321',
        cargo: 'Administrador',
        tipo_personal: 'planilla',
        fecha_ingreso: new Date(),
        fecha_nacimiento: new Date('1990-05-10'),
        telefono: '987654321',
        email_corporativo: 'juan.perez@empresa.com',
        direccion: 'Av. Principal 123',
        distrito: 'Miraflores',
        auditoria_progreso: null,
        estado_legajo: 'pendiente',
      })
      .returning();

    console.log('Seeders insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar seeders:', err);
  } finally {
    try {
      await drizzleService.onModuleDestroy();
      console.log('Conexión cerrada correctamente.');
    } catch (err) {
      console.warn('Error al cerrar la base de datos (ignorado):', err);
    }
  }

}

// Ejecutar seed
main();