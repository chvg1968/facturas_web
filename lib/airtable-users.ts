import type { UserRecord, UserRole, UserStatus } from "./types";

interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

interface AirtableListResponse {
  records: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
}

type UserWriteFields = Partial<{
  Email: string;
  Nombre: string;
  "Password Hash": string;
  Rol: UserRole;
  Estado: UserStatus;
  "Email Verificado": boolean;
  "Token Verificacion": string | null;
  "Token Recuperacion": string | null;
  "Token Expiracion": string | null;
  "Fecha Registro": string;
  "Ultimo Login": string | null;
  "Intentos Fallidos": number;
}>;

function loadConfig(): AirtableConfig {
  const apiKey = process.env.AIRTABLE_API_KEY ?? "";
  const baseId = process.env.AIRTABLE_BASE_ID ?? "";
  const tableName = process.env.AIRTABLE_USERS_TABLE_NAME ?? "Usuarios";

  if (!apiKey || !baseId) {
    throw new Error("Faltan variables AIRTABLE_API_KEY y/o AIRTABLE_BASE_ID");
  }

  return { apiKey, baseId, tableName };
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function stringify(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function boolValue(value: unknown): boolean {
  return value === true;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapUser(record: { id: string; fields: Record<string, unknown> }): UserRecord {
  return {
    id: record.id,
    email: stringify(record.fields.Email) ?? "",
    nombre: stringify(record.fields.Nombre) ?? "",
    passwordHash: stringify(record.fields["Password Hash"]) ?? "",
    rol: (stringify(record.fields.Rol) as UserRole | null) ?? "editor",
    estado: (stringify(record.fields.Estado) as UserStatus | null) ?? "pendiente",
    emailVerificado: boolValue(record.fields["Email Verificado"]),
    tokenVerificacion: stringify(record.fields["Token Verificacion"]),
    tokenRecuperacion: stringify(record.fields["Token Recuperacion"]),
    tokenExpiracion: stringify(record.fields["Token Expiracion"]),
    fechaRegistro: stringify(record.fields["Fecha Registro"]),
    ultimoLogin: stringify(record.fields["Ultimo Login"]),
    intentosFallidos: numberValue(record.fields["Intentos Fallidos"]),
  };
}

function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function listUsersByFormula(formula: string): Promise<UserRecord[]> {
  const cfg = loadConfig();
  const url = new URL(
    `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName)}`,
  );
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "10");

  const res = await fetch(url, {
    headers: authHeaders(cfg.apiKey),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Airtable listUsers: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as AirtableListResponse;
  return data.records.map(mapUser);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await listUsersByFormula(`LOWER({Email})='${escapeFormulaValue(email.toLowerCase())}'`);
  return users[0] ?? null;
}

export async function findUserByVerificationTokenHash(
  tokenHash: string,
): Promise<UserRecord | null> {
  const users = await listUsersByFormula(
    `{Token Verificacion}='${escapeFormulaValue(tokenHash)}'`,
  );
  return users[0] ?? null;
}

export async function findUserByResetTokenHash(tokenHash: string): Promise<UserRecord | null> {
  const users = await listUsersByFormula(
    `{Token Recuperacion}='${escapeFormulaValue(tokenHash)}'`,
  );
  return users[0] ?? null;
}

export async function createUser(fields: UserWriteFields): Promise<UserRecord> {
  const cfg = loadConfig();
  const url = `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(cfg.apiKey),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(`Airtable createUser: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string; fields: Record<string, unknown> };
  return mapUser(data);
}

export async function updateUser(
  recordId: string,
  fields: UserWriteFields,
): Promise<UserRecord> {
  const cfg = loadConfig();
  const url = `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName)}/${recordId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: authHeaders(cfg.apiKey),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(`Airtable updateUser: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string; fields: Record<string, unknown> };
  return mapUser(data);
}
