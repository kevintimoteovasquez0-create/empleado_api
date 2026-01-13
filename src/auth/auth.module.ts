import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    UsuarioModule,
    PrismaModule,
    EmailModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
