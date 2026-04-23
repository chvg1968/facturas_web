import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyEmailSchema } from "@/lib/auth/schemas";
import { verifyEmailToken } from "@/lib/auth/service";

export const runtime = "nodejs";

function redirectWithStatus(status: "success" | "error", message: string): NextResponse {
  const url = new URL("/verificar-email", process.env.APP_BASE_URL || "http://localhost:3000");
  url.searchParams.set("status", status);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const input = verifyEmailSchema.parse({
      token: url.searchParams.get("token") ?? "",
    });
    await verifyEmailToken(input.token);
    return redirectWithStatus("success", "Tu correo fue verificado. Ya puedes iniciar sesión.");
  } catch (error) {
    if (error instanceof ZodError) {
      return redirectWithStatus("error", error.issues[0]?.message ?? "Token inválido");
    }
    const message = error instanceof Error ? error.message : "No se pudo verificar el correo";
    return redirectWithStatus("error", message);
  }
}
