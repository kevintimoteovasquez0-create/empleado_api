import { SetMetadata } from '@nestjs/common';

export const ACCESO_KEY = 'accesos';
export const AccesoRequerido = (...accesos: string[]) => SetMetadata(ACCESO_KEY, accesos);