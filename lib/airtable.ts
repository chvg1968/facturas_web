import type { AirtableRecord, FacturaAttachment, FacturaInput } from "./types";

interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
  attachmentField: string;
}

function loadConfig(): AirtableConfig {
  const apiKey = process.env.AIRTABLE_API_KEY ?? "";
  const baseId = process.env.AIRTABLE_BASE_ID ?? "";
  const tableName = process.env.AIRTABLE_TABLE_NAME ?? "Facturas";
  const attachmentField = process.env.AIRTABLE_ATTACHMENT_FIELD ?? "Doc";

  if (!apiKey || !baseId) {
    throw new Error(
      "Faltan variables de entorno: AIRTABLE_API_KEY y/o AIRTABLE_BASE_ID",
    );
  }
  return { apiKey, baseId, tableName, attachmentField };
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function toAirtableFields(input: FacturaInput) {
  return {
    Name: input.name,
    Proveedor: input.proveedor,
    Valor: input.valor,
    Fecha_Vence: input.fechaVence,
  };
}

async function createRecord(
  cfg: AirtableConfig,
  input: FacturaInput,
): Promise<AirtableRecord> {
  const url = `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(cfg.apiKey),
    body: JSON.stringify({ fields: toAirtableFields(input) }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Airtable createRecord: ${res.status} ${msg}`);
  }
  return (await res.json()) as AirtableRecord;
}

async function uploadAttachment(
  cfg: AirtableConfig,
  recordId: string,
  file: FacturaAttachment,
): Promise<void> {
  const url = `https://content.airtable.com/v0/${cfg.baseId}/${recordId}/${encodeURIComponent(cfg.attachmentField)}/uploadAttachment`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(cfg.apiKey),
    body: JSON.stringify({
      contentType: file.contentType,
      file: file.base64,
      filename: file.filename,
    }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Airtable uploadAttachment: ${res.status} ${msg}`);
  }
}

export async function saveFactura(
  input: FacturaInput,
  file: FacturaAttachment,
): Promise<string> {
  const cfg = loadConfig();
  const record = await createRecord(cfg, input);
  await uploadAttachment(cfg, record.id, file);
  return record.id;
}
