export const PROVEEDORES = [
  "Tigo",
  "Soi",
  "Mastercard",
  "EPM",
  "Carulla",
] as const;

export type Proveedor = (typeof PROVEEDORES)[number];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];
