"use client";

import { useState } from "react";
import Link from "next/link";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { Toast } from "./Toast";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import type { AuthResponse } from "@/lib/types";

type FieldErrors = Partial<Record<"email", string>>;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.issues[0]?.message ?? "Correo inválido" });
      return;
    }

    setErrors({});
    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as AuthResponse;
      if (!data.ok) {
        setStatus({ kind: "error", message: data.error });
        return;
      }
      setStatus({ kind: "success", message: data.message });
    } catch {
      setStatus({ kind: "error", message: "No se pudo procesar la solicitud." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Correo"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      {status.kind === "success" && <Toast kind="success" message={status.message} />}
      {status.kind === "error" && <Toast kind="error" message={status.message} />}

      <div className="space-y-3 pt-2">
        <SubmitButton loading={status.kind === "loading"} loadingLabel="Enviando enlace…">
          Enviar enlace de recuperación
        </SubmitButton>
        <p className="text-sm text-pastel-blue-500">
          <Link href="/login" className="font-medium text-pastel-blue-700 underline underline-offset-4">
            Volver a login
          </Link>
        </p>
      </div>
    </form>
  );
}
