import {
  ACCEPTED_MIME,
  MAX_FILE_SIZE_BYTES,
  PROVEEDORES,
  type Proveedor,
} from "./constants";

export type ValidationErrors = Partial<{
  name: string;
  proveedor: string;
  valor: string;
  fechaVence: string;
  doc: string;
}>;

const isProveedor = (v: string): v is Proveedor =>
  (PROVEEDORES as readonly string[]).includes(v);

const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export function validateFactura(input: {
  name: string;
  proveedor: string;
  valor: string;
  fechaVence: string;
  doc: File | null;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.name.trim()) errors.name = "El nombre es obligatorio";
  else if (input.name.trim().length > 120) errors.name = "Máximo 120 caracteres";

  if (!input.proveedor) errors.proveedor = "Selecciona un proveedor";
  else if (!isProveedor(input.proveedor)) errors.proveedor = "Proveedor no válido";

  const valorNum = Number(input.valor);
  if (input.valor === "" || Number.isNaN(valorNum)) errors.valor = "Ingresa un valor numérico";
  else if (valorNum < 0) errors.valor = "El valor no puede ser negativo";

  if (!input.fechaVence) errors.fechaVence = "Selecciona una fecha";
  else if (!isIsoDate(input.fechaVence)) errors.fechaVence = "Formato de fecha inválido";

  if (!input.doc) errors.doc = "Adjunta la factura";
  else if (input.doc.size > MAX_FILE_SIZE_BYTES) errors.doc = "Máximo 10 MB";
  else if (!ACCEPTED_MIME.includes(input.doc.type)) errors.doc = "Formato no soportado";

  return errors;
}

export const hasErrors = (e: ValidationErrors) => Object.keys(e).length > 0;
