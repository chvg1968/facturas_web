import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { resetPassword } from "@/lib/auth/service";
import type { AuthResponse } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json<AuthResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = resetPasswordSchema.parse(json);
    await resetPassword(input);

    return NextResponse.json<AuthResponse>({
      ok: true,
      message: "Tu contraseña fue actualizada. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return bad(error.issues[0]?.message ?? "Datos inválidos");
    }
    const message = error instanceof Error ? error.message : "Error inesperado";
    const status =
      message === "El enlace para restablecer la contraseña no es válido" ||
      message === "El enlace para restablecer la contraseña ha expirado"
        ? 400
        : 500;
    return bad(message, status);
  }
}
