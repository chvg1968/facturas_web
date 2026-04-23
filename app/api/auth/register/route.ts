import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/lib/auth/schemas";
import { registerUser } from "@/lib/auth/service";
import type { AuthResponse } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json<AuthResponse>({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = registerSchema.parse(json);
    await registerUser(input);

    return NextResponse.json<AuthResponse>({
      ok: true,
      message: "Te enviamos un correo de verificación para activar tu cuenta.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return bad(error.issues[0]?.message ?? "Datos inválidos");
    }
    const message = error instanceof Error ? error.message : "Error inesperado";
    return bad(message, message === "Ya existe una cuenta con ese correo" ? 409 : 500);
  }
}
