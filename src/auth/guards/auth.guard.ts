import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConstants } from '../constants/jwt.constant';
import { Request, Response } from 'express';
import { ACCESO_KEY } from '../decorators/acceso.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService, // 🔹 Consultar accesos en la BD
    private reflector: Reflector,  
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractTokenFromCookie(request); // 🔥 Ahora extrae el token desde la cookie

    if (!token) {
      throw new UnauthorizedException('No autenticado');
    }

    try {
      // 🔹 Validar y decodificar el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request["user"] = payload; // Guardar usuario en la request

      // 🔹 Obtener accesos requeridos desde @AccesoRequerido()
      const requiredAccesses = this.reflector.get<string[]>(ACCESO_KEY, context.getHandler());

      if (requiredAccesses) {
        // 🔹 Consultar accesos del usuario en la BD según su rol
        const userAccesses = await this.prisma.rol_Acceso.findMany({
          where: { rol_id: payload.rol_id },
          include: { acceso: true },
        });

        const userAccessNames = userAccesses.map(a => a.acceso.path); // Obtener nombres de accesos

        if (!this.hasRequiredAccess(userAccessNames, requiredAccesses)) {
          throw new ForbiddenException('No tienes los accesos necesarios');
        }
      }

    } catch (error) {
      response.clearCookie('jwt');
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Sesión expirada, inicia sesión nuevamente');
      } else {
        throw new UnauthorizedException('Token inválido');
      }
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.jwt; // 🔥 Extraer el token desde la cookie
  }

  private hasRequiredAccess(userAccesses: string[], requiredAccesses: string[]): boolean {
    return requiredAccesses.every(access => userAccesses.includes(access));
  }
}
