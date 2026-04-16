"use client";

import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
}

export function SelectField({
  label,
  options,
  placeholder = "Selecciona una opción",
  error,
  id,
  ...rest
}: Props) {
  const selectId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={selectId} className="field-label">
        {label}
      </label>
      <select id={selectId} className="field-input appearance-none pr-10" {...rest}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
