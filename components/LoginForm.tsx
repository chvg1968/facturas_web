"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { Toast } from "./Toast";
import { loginSchema } from "@/lib/auth/schemas";
import type { AuthResponse } from "@/lib/types";

type FieldErrors = Partial<Record<"email" | "password", string>>;

interface LoginState {
  email: string;
  password: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const EMPTY_STATE: LoginState = {
  email: "",
  password: "",
};

export function LoginForm({
  registered,
  resetDone,
}: {
  registered: boolean;
  resetDone: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>(EMPTY_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>(
    registered
      ? {
          kind: "success",
          message: "Cuenta creada. Revisa tu correo y verifica tu email antes de entrar.",
        }
      : resetDone
        ? {
            kind: "success",
            message: "Contraseña actualizada. Ya puedes iniciar sesión.",
          }
      : { kind: "idle" },
  );

  const update = <K extends keyof LoginState>(key: K, value: LoginState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(state);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !(path in nextErrors)) {
          nextErrors[path as keyof FieldErrors] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/auth/login", {
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
      router.push("/");
      router.refresh();
    } catch {
      setStatus({ kind: "error", message: "No se pudo iniciar sesión." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Correo"
        name="email"
        type="email"
        value={state.email}
        onChange={(event) => update("email", event.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <FormField
        label="Contraseña"
        name="password"
        type="password"
        value={state.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      {status.kind === "success" && <Toast kind="success" message={status.message} />}
      {status.kind === "error" && <Toast kind="error" message={status.message} />}

      <div className="space-y-3 pt-2">
        <SubmitButton loading={status.kind === "loading"} loadingLabel="Entrando…">
          Entrar
        </SubmitButton>
        <p className="text-sm text-pastel-blue-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-pastel-blue-700 underline underline-offset-4">
            Regístrate
          </Link>
        </p>
        <p className="text-sm text-pastel-blue-500">
          <Link
            href="/olvide-password"
            className="font-medium text-pastel-blue-700 underline underline-offset-4"
          >
            Olvidé mi contraseña
          </Link>
        </p>
      </div>
    </form>
  );
}
