import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export const jwtConstants = {
    secret: process.env.JWT_SECRET,
};