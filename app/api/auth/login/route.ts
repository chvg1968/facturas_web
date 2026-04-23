import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/auth/schemas";
import { loginUser } from "@/lib/auth/service";
import type { AuthResponse } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json<AuthResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = loginSchema.parse(json);
    await loginUser(input);

    return NextResponse.json<AuthResponse>({
      ok: true,
      message: "Inicio de sesión correcto",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return bad(error.issues[0]?.message ?? "Datos inválidos");
    }
    const message = error instanceof Error ? error.message : "Error inesperado";
    const status =
      message === "Credenciales inválidas" ||
      message === "Debes verificar tu correo antes de iniciar sesión"
        ? 401
        : message === "Tu cuenta está bloqueada"
          ? 423
          : 500;
    return bad(message, status);
  }
}
