import type { Proveedor } from "./constants";

export interface FacturaInput {
  name: string;
  proveedor: Proveedor;
  valor: number;
  fechaVence: string;
}

export interface FacturaAttachment {
  filename: string;
  contentType: string;
  base64: string;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
}

export interface ApiSuccess {
  ok: true;
  recordId: string;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse = ApiSuccess | ApiError;

export type UserRole = string;
export type UserStatus = string;

export interface UserRecord {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
  rol: UserRole;
  estado: UserStatus;
  emailVerificado: boolean;
  tokenVerificacion: string | null;
  tokenRecuperacion: string | null;
  tokenExpiracion: string | null;
  fechaRegistro: string | null;
  ultimoLogin: string | null;
  intentosFallidos: number;
}

export interface AuthSuccess {
  ok: true;
  message: string;
}

export type AuthResponse = AuthSuccess | ApiError;
