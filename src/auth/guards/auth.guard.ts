import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants/jwt.constant';
import { Request, Response } from 'express';
import { ACCESO_KEY } from '../decorators/acceso.decorator';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { Rol_Acceso_Table } from 'src/drizzle/schema/rol_acceso';
import { eq } from 'drizzle-orm';
import { RolTable } from 'src/drizzle/schema/rol';
import { AccesoTable } from 'src/drizzle/schema/acceso';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly drizzleService: DrizzleService,
    private readonly reflector: Reflector,  
  ) {}

  private get db(){
    return this.drizzleService.getDb();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('No autenticado');
    }

    try {
      // Validar y decodificar el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      // Validar que no sea un token temporal (para 2FA)
      if (payload.pendingTwoFactor) {
        throw new UnauthorizedException('Debes completar la verificación 2FA primero');
      }

      request["user"] = payload; // Guardar usuario en la request

      // Obtener accesos requeridos desde @AccesoRequerido()
      const requiredAccesses = this.reflector.get<string[]>(ACCESO_KEY, context.getHandler());

      if (requiredAccesses) {
        // Consultar accesos del usuario en la BD según su rol

        const userAccesses = await this.db
          .select({
            rol: {
              id: RolTable.id
            },
            acceso: {
              id: AccesoTable.id,
              path: AccesoTable.path,
              descripcion: AccesoTable.descripcion
            }
          })
          .from(Rol_Acceso_Table)
          .innerJoin(RolTable, eq(Rol_Acceso_Table.rol_id, RolTable.id))
          .innerJoin(AccesoTable, eq(Rol_Acceso_Table.acceso_id, AccesoTable.id))
          .where(
            eq(Rol_Acceso_Table.rol_id, payload.rol_id)
          )

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
    return request.cookies?.jwt;
  }

  private hasRequiredAccess(userAccesses: string[], requiredAccesses: string[]): boolean {
    return requiredAccesses.every(access => userAccesses.includes(access));
  }
}
