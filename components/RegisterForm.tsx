"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { Toast } from "./Toast";
import { registerSchema } from "@/lib/auth/schemas";
import type { AuthResponse } from "@/lib/types";

type FieldErrors = Partial<Record<"nombre" | "email" | "password" | "confirmPassword", string>>;

interface RegisterState {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_STATE: RegisterState = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState<RegisterState>(EMPTY_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const update = <K extends keyof RegisterState>(key: K, value: RegisterState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(state);
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
      const res = await fetch("/api/auth/register", {
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
      setState(EMPTY_STATE);
      router.push("/login?registered=1");
    } catch {
      setStatus({ kind: "error", message: "No se pudo completar el registro." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Nombre"
        name="nombre"
        value={state.nombre}
        onChange={(event) => update("nombre", event.target.value)}
        error={errors.nombre}
        autoComplete="name"
      />
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
        autoComplete="new-password"
      />
      <FormField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        value={state.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {status.kind === "success" && <Toast kind="success" message={status.message} />}
      {status.kind === "error" && <Toast kind="error" message={status.message} />}

      <div className="space-y-3 pt-2">
        <SubmitButton loading={status.kind === "loading"} loadingLabel="Creando cuenta…">
          Crear cuenta
        </SubmitButton>
        <p className="text-sm text-pastel-blue-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-pastel-blue-700 underline underline-offset-4">
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  );
}
