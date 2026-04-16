"use client";

import { useState } from "react";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { FileField } from "./FileField";
import { SubmitButton } from "./SubmitButton";
import { Toast } from "./Toast";
import { ACCEPTED_MIME, PROVEEDORES } from "@/lib/constants";
import { hasErrors, validateFactura, type ValidationErrors } from "@/lib/validators";
import type { ApiResponse } from "@/lib/types";

interface FormState {
  name: string;
  proveedor: string;
  valor: string;
  fechaVence: string;
  doc: File | null;
}

const EMPTY: FormState = {
  name: "",
  proveedor: "",
  valor: "",
  fechaVence: "",
  doc: null,
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

async function submitFactura(state: FormState): Promise<ApiResponse> {
  const body = new FormData();
  body.set("name", state.name);
  body.set("proveedor", state.proveedor);
  body.set("valor", state.valor);
  body.set("fechaVence", state.fechaVence);
  if (state.doc) body.set("doc", state.doc);

  const res = await fetch("/api/facturas", { method: "POST", body });
  return (await res.json()) as ApiResponse;
}

export function FacturaForm() {
  const [state, setState] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateFactura(state);
    setErrors(found);
    if (hasErrors(found)) return;

    setStatus({ kind: "loading" });
    try {
      const res = await submitFactura(state);
      if (res.ok) {
        setStatus({ kind: "success", message: "Factura registrada correctamente." });
        setState(EMPTY);
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    } catch {
      setStatus({ kind: "error", message: "No se pudo conectar con el servidor." });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Nombre"
        name="name"
        placeholder="Ej. Internet, Servicios públicos, Tarjeta de crédito"
        value={state.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        autoComplete="off"
      />

      <SelectField
        label="Proveedor"
        name="proveedor"
        options={PROVEEDORES}
        value={state.proveedor}
        onChange={(e) => update("proveedor", e.target.value)}
        error={errors.proveedor}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          label="Valor"
          name="valor"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={state.valor}
          onChange={(e) => update("valor", e.target.value)}
          error={errors.valor}
        />

        <FormField
          label="Fecha de vencimiento"
          name="fechaVence"
          type="date"
          value={state.fechaVence}
          onChange={(e) => update("fechaVence", e.target.value)}
          error={errors.fechaVence}
          hint="Formato día/mes/año"
        />
      </div>

      <FileField
        label="Documento"
        name="doc"
        accept={ACCEPTED_MIME.join(",")}
        file={state.doc}
        error={errors.doc}
        onChange={(file) => update("doc", file)}
      />

      {status.kind === "success" && <Toast kind="success" message={status.message} />}
      {status.kind === "error" && <Toast kind="error" message={status.message} />}

      <div className="flex justify-end pt-2">
        <SubmitButton loading={status.kind === "loading"}>Guardar factura</SubmitButton>
      </div>
    </form>
  );
}
