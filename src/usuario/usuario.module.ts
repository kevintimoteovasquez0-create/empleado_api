import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { FotoModule } from '../foto/foto.module';
import { EmailModule } from '../email/email.module';
// Se corrige la ruta de importación para usar ruta relativa consistente
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  // DrizzleModule ya está importado y disponible para inyectar DrizzleService en este módulo
  imports: [DrizzleModule, forwardRef(() => FotoModule), EmailModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
