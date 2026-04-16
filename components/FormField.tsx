"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ label, error, hint, id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input id={inputId} className="field-input" {...rest} />
      {hint && !error && (
        <p className="mt-1 text-xs text-pastel-blue-500/80">{hint}</p>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
