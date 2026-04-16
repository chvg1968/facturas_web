"use client";

import { useRef } from "react";

interface Props {
  label: string;
  name: string;
  accept: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileField({ label, name, accept, file, error, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="field-input text-left flex items-center justify-between gap-3 hover:bg-white"
        >
          <span className="truncate">
            {file ? file.name : "Selecciona un archivo (PDF o imagen)"}
          </span>
          <span className="text-pastel-green-700 text-sm font-medium shrink-0">
            {file ? "Cambiar" : "Examinar"}
          </span>
        </button>
        {file && (
          <p className="text-xs text-pastel-blue-500/80">
            {formatSize(file.size)} · {file.type || "archivo"}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
