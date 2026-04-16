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
