import { envs } from 'src/config';

if (envs.jwtSecret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export const jwtConstants = {
    secret: envs.jwtSecret,
};