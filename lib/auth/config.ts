export interface AuthAirtableConfig {
  defaultRole: string;
  statusPending: string;
  statusActive: string;
  statusBlocked: string;
}

export function getAuthAirtableConfig(): AuthAirtableConfig {
  return {
    defaultRole: process.env.AUTH_DEFAULT_ROLE || "editor",
    statusPending: process.env.AUTH_STATUS_PENDING || "pendiente",
    statusActive: process.env.AUTH_STATUS_ACTIVE || "activo",
    statusBlocked: process.env.AUTH_STATUS_BLOCKED || "bloqueado",
  };
}
