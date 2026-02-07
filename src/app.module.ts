import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { RolModule } from './rol/rol.module';
import { AccesoModule } from './acceso/acceso.module';
import { ReniecModule } from './reniec/reniec.module';
import { FotoModule } from './foto/foto.module';
import { EmpresaModule } from './empresa/empresa.module';
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConvocatoriaModule } from './convocatoria/convocatoria.module';
import { HistorialConvocatoriaModule } from './historial_convocatoria/historial_convocatoria.module';
import { AreaModule } from './area/area.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { LicenciaMedicaModule } from './licencia_medica/licencia_medica.module';

@Module({
  imports: [
    UsuarioModule,
    AuthModule,
    EmailModule,
    RolModule,
    AccesoModule,
    ReniecModule,
    FotoModule,
    EmpresaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), DrizzleModule, ConvocatoriaModule, HistorialConvocatoriaModule, AreaModule, EmpleadoModule, LicenciaMedicaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
