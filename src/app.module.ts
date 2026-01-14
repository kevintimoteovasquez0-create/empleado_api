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
    }), DrizzleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
