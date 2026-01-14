import 'dotenv/config';
import * as Joi from 'joi';

// 1. Definimos la interfaz para que TypeScript sepa qué esperar
interface EnvVars {
  BASE_URL: string;
  DATABASE_URL: string;
  BASE_FRONTEND_URL: string;
  PORT: number;
  EMAIL_USER: string;
  API_RENIEC_DNI_URL: string;
  TOKEN_RENIEC_DNI: string;
  BREVO_API_KEY: string;
  EMAIL_EMPRESA: string;
}

// 2. Creamos el esquema de validación
const envsSchema = Joi.object({
  BASE_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  BASE_FRONTEND_URL: Joi.string().required(),
  PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().required(),
  API_RENIEC_DNI_URL: Joi.string().required(),
  TOKEN_RENIEC_DNI: Joi.string().required(),
  BREVO_API_KEY: Joi.string().required(),
  EMAIL_EMPRESA: Joi.string().required(),
}).unknown(true);

// 3. Validamos de forma que el linter no proteste
const validation = envsSchema.validate(process.env);

// Si hay error, lo lanzamos
if (validation.error) {
  throw new Error(`Config validation error: ${validation.error.message}`);
}

// Forzamos el tipado aquí para que envVars sea seguro
const envVars = validation.value as EnvVars;

// 4. Exportamos el objeto final
export const envs = {
  baseUrl: envVars.BASE_URL,
  dataBaseUrl: envVars.DATABASE_URL,
  baseFrontendUrl: envVars.BASE_FRONTEND_URL,
  port: envVars.PORT,
  emailUser: envVars.EMAIL_USER,
  apiReniecDniUrl: envVars.API_RENIEC_DNI_URL,
  tokenReniecDni: envVars.TOKEN_RENIEC_DNI,
  brevoApiKey: envVars.BREVO_API_KEY,
  emailEmpresa: envVars.EMAIL_EMPRESA,
};
