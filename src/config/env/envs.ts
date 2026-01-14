import 'dotenv/config'
import Joi from 'Joi'

interface EnvVars{
  BASE_URL: string,
  DATABASE_URL: string,
  BASE_FRONTEND_URL: string,
  PORT: number,
  EMAIL_USER: string,
  API_RENIEC_DNI_URL: string,
  TOKEN_RENIEC_DNI: string,
  VERIFY_EMAIL_PATH: string,
  JWT_SECRET: string,
  RESET_PASSWORD_PATH: string,
  // Emails
  BREVO_API_KEY: string,
  EMAIL_EMPRESA: string
}

const envsSchema = Joi.object({
  BASE_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  BASE_FRONTEND_URL: Joi.string().required(),
  PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().required(),
  API_RENIEC_DNI_URL: Joi.string().required(),
  TOKEN_RENIEC_DNI: Joi.string().required(),
  VERIFY_EMAIL_PATH: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  RESET_PASSWORD_PATH: Joi.string().required(),
  //Emails
  BREVO_API_KEY: Joi.string().required(),
  EMAIL_EMPRESA: Joi.string().required()
}).unknown(true)

const {error, value} = envsSchema.validate( process.env )

if(error){
  throw new Error(`Config validation error ${error.message}`)
}

const envVars: EnvVars = value;

export const envs = {
  baseUrl: envVars.BASE_URL,
  dataBaseUrl: envVars.DATABASE_URL,
  baseFrontendUrl: envVars.BASE_FRONTEND_URL,
  port: envVars.PORT,
  emailUser: envVars.EMAIL_USER,
  apiReniecDniUrl: envVars.API_RENIEC_DNI_URL,
  tokenReniecDni: envVars.TOKEN_RENIEC_DNI,
  verifyEmailPath: envVars.VERIFY_EMAIL_PATH,
  jwtSecret: envVars.JWT_SECRET,
  resetPassPath: envVars.RESET_PASSWORD_PATH,
  //Emails
  brevoApiKey: envVars.BREVO_API_KEY,
  emailEmpresa: envVars.EMAIL_EMPRESA
}