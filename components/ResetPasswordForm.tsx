"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { Toast } from "./Toast";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import type { AuthResponse } from "@/lib/types";

type FieldErrors = Partial<Record<"password" | "confirmPassword", string>>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "password" || path === "confirmPassword") {
          nextErrors[path] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/auth/reset-password", {
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
      setPassword("");
      setConfirmPassword("");
      router.push("/login?reset=1");
    } catch {
      setStatus({ kind: "error", message: "No se pudo actualizar la contraseña." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Nueva contraseña"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />
      <FormField
        label="Confirmar nueva contraseña"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {status.kind === "success" && <Toast kind="success" message={status.message} />}
      {status.kind === "error" && <Toast kind="error" message={status.message} />}

      <div className="space-y-3 pt-2">
        <SubmitButton loading={status.kind === "loading"} loadingLabel="Actualizando…">
          Guardar nueva contraseña
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
