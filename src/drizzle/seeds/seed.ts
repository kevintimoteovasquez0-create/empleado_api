import * as bcrypt from 'bcryptjs';
import { RolTable } from '../schema/rol';
import { EmpresaTable } from '../schema/empresa';
import { AccesoTable } from '../schema/acceso';
import { Rol_Acceso_Table } from '../schema/rol_acceso';
import { UsuarioTable } from '../schema/usuario';
import { DrizzleService } from '../drizzle.service';

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
      razonSocial: "Empresa de carnes",
      ruc: "12345678911"
    }).returning();

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
        rolId: adminRole.id,
        accesoId: acceso.id,
      }))
    );

    await db.insert(Rol_Acceso_Table).values(
      accesos.map((acceso) => ({
        rolId: adminRoleSegundo.id,
        accesoId: acceso.id,
      }))
    );

    const hashedPassword = await bcrypt.hash('Prueb@123', 10);

    const usuarioData = {
      nombre: 'usuario',
      apellido: 'apellidousuario',
      tipoDocumento: "DNI" as const,  
      numeroDocumento: '78945612',  
      fechaNacimiento: new Date('1990-01-01').toISOString(),  
      fechaIngreso: new Date().toISOString(),
      direccion: 'Av. Siempre Viva 742',
      pais: 'Perú',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      telefono: '987654321',
      email: 'empresoftperu@gmail.com',
      password: hashedPassword,
      rolId: adminRole.id, 
      empresaId: empresa.id, 
      nombreImagen: 'empresoft.jpg',
      verificadoEmail: true, 
    };

    const usuarioDataDos = {
      nombre: 'Carlos',
      apellido: 'Ramírez Torres',
      tipoDocumento: "DNI" as const,
      numeroDocumento: '45612378',
      fechaNacimiento: new Date('1992-06-15').toISOString(),
      fechaIngreso: new Date().toISOString(),
      direccion: 'Calle Los Olivos 123',
      pais: 'Perú',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'San Isidro',
      telefono: '956123789',
      email: 'leonsaavedrajosefabian573@gmail.com',
      password: hashedPassword,
      rolId: adminRoleSegundo.id,  
      empresaId: empresa.id,
      nombreImagen: 'empresoft.jpg',
      verificadoEmail: true, 
    };
    
    // Creación en Prisma
    await db.insert(UsuarioTable).values(usuarioData); 
    await db.insert(UsuarioTable).values(usuarioDataDos); 

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