import {
  createUser,
  findUserByEmail,
  findUserByResetTokenHash,
  findUserByVerificationTokenHash,
  updateUser,
} from "@/lib/airtable-users";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import type { UserRecord } from "@/lib/types";
import { hashPassword, verifyPassword } from "./password";
import { setSession } from "./session";
import { generateToken, hashToken, tokenExpiration } from "./tokens";

const MAX_FAILED_ATTEMPTS = 5;

export async function registerUser(input: {
  nombre: string;
  email: string;
  password: string;
}): Promise<void> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("Ya existe una cuenta con ese correo");
  }

  const verificationToken = generateToken();
  const passwordHash = await hashPassword(input.password);

  await createUser({
    Email: input.email,
    Nombre: input.nombre,
    "Password Hash": passwordHash,
    Rol: "editor",
    Estado: "pendiente",
    "Email Verificado": false,
    "Token Verificacion": hashToken(verificationToken),
    "Token Expiracion": tokenExpiration(24),
    "Fecha Registro": new Date().toISOString(),
    "Intentos Fallidos": 0,
  });

  await sendVerificationEmail({
    email: input.email,
    nombre: input.nombre,
    token: verificationToken,
  });
}

function isExpired(user: UserRecord): boolean {
  if (!user.tokenExpiracion) return true;
  return Date.parse(user.tokenExpiracion) <= Date.now();
}

export async function verifyEmailToken(token: string): Promise<void> {
  const user = await findUserByVerificationTokenHash(hashToken(token));
  if (!user) {
    throw new Error("El enlace de verificación no es válido");
  }
  if (isExpired(user)) {
    throw new Error("El enlace de verificación ha expirado");
  }
  if (user.emailVerificado) {
    return;
  }

  await updateUser(user.id, {
    Estado: "activo",
    "Email Verificado": true,
    "Token Verificacion": null,
    "Token Expiracion": null,
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<void> {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new Error("Credenciales inválidas");
  }
  if (user.estado === "bloqueado") {
    throw new Error("Tu cuenta está bloqueada");
  }
  if (!user.emailVerificado || user.estado !== "activo") {
    throw new Error("Debes verificar tu correo antes de iniciar sesión");
  }

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) {
    const failedAttempts = user.intentosFallidos + 1;
    await updateUser(user.id, {
      "Intentos Fallidos": failedAttempts,
      Estado: failedAttempts >= MAX_FAILED_ATTEMPTS ? "bloqueado" : user.estado,
    });
    throw new Error("Credenciales inválidas");
  }

  await updateUser(user.id, {
    "Intentos Fallidos": 0,
    "Ultimo Login": new Date().toISOString(),
  });

  await setSession({
    userId: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
  });
}

export async function requestPasswordReset(input: { email: string }): Promise<void> {
  const user = await findUserByEmail(input.email);
  if (!user || !user.emailVerificado || user.estado !== "activo") {
    return;
  }

  const resetToken = generateToken();

  await updateUser(user.id, {
    "Token Recuperacion": hashToken(resetToken),
    "Token Expiracion": tokenExpiration(1),
  });

  await sendPasswordResetEmail({
    email: user.email,
    nombre: user.nombre,
    token: resetToken,
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  const user = await findUserByResetTokenHash(hashToken(input.token));
  if (!user) {
    throw new Error("El enlace para restablecer la contraseña no es válido");
  }
  if (isExpired(user)) {
    throw new Error("El enlace para restablecer la contraseña ha expirado");
  }

  const passwordHash = await hashPassword(input.password);
  await updateUser(user.id, {
    "Password Hash": passwordHash,
    "Token Recuperacion": null,
    "Token Expiracion": null,
    "Intentos Fallidos": 0,
    Estado: user.emailVerificado ? "activo" : user.estado,
  });
}
