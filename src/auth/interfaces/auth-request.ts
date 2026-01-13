import { Request } from 'express';
import { AuthPayload } from 'src/auth/interfaces/auth-payload';

export interface AuthRequest extends Request {
  user: AuthPayload;
}