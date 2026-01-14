import { TipoDocumentoUsuario } from "src/drizzle/schema/usuario"

export const TipoDocumentoUsuarioList = TipoDocumentoUsuario.enumValues;
export type TipoDocumentoUsuarioType = (typeof TipoDocumentoUsuario.enumValues)[number];