import { NextResponse } from "next/server";
import { saveFactura } from "@/lib/airtable";
import {
  ACCEPTED_MIME,
  MAX_FILE_SIZE_BYTES,
  PROVEEDORES,
  type Proveedor,
} from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json<ApiResponse>({ ok: false, error }, { status });
}

async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}

function isProveedor(v: string): v is Proveedor {
  return (PROVEEDORES as readonly string[]).includes(v);
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Formato de solicitud inválido");
  }

  const name = String(form.get("name") ?? "").trim();
  const proveedor = String(form.get("proveedor") ?? "");
  const valorRaw = String(form.get("valor") ?? "");
  const fechaVence = String(form.get("fechaVence") ?? "");
  const doc = form.get("doc");

  if (!name) return bad("El nombre es obligatorio");
  if (!isProveedor(proveedor)) return bad("Proveedor no válido");

  const valor = Number(valorRaw);
  if (Number.isNaN(valor) || valor < 0) return bad("Valor no válido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaVence)) return bad("Fecha no válida");

  if (!(doc instanceof File)) return bad("Adjunta la factura");
  if (doc.size === 0) return bad("El archivo está vacío");
  if (doc.size > MAX_FILE_SIZE_BYTES) return bad("El archivo excede 10 MB");
  if (!ACCEPTED_MIME.includes(doc.type)) return bad("Formato de archivo no soportado");

  try {
    const recordId = await saveFactura(
      { name, proveedor, valor, fechaVence },
      {
        filename: doc.name || "factura",
        contentType: doc.type,
        base64: await fileToBase64(doc),
      },
    );
    return NextResponse.json<ApiResponse>({ ok: true, recordId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error inesperado";
    return bad(msg, 500);
  }
}
