export interface AuthPayload {
  id: number;
  email: string;
  rol_id: number;
  rol_nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  foto_usuario: string | null;
}