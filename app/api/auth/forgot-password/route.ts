import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { requestPasswordReset } from "@/lib/auth/service";
import type { AuthResponse } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json<AuthResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = forgotPasswordSchema.parse(json);
    await requestPasswordReset(input);

    return NextResponse.json<AuthResponse>({
      ok: true,
      message:
        "Si el correo existe y está activo, te enviamos un enlace para restablecer la contraseña.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return bad(error.issues[0]?.message ?? "Datos inválidos");
    }
    const message = error instanceof Error ? error.message : "Error inesperado";
    return bad(message, 500);
  }
}
