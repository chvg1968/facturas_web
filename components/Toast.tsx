"use client";

interface Props {
  kind: "success" | "error";
  message: string;
}

export function Toast({ kind, message }: Props) {
  const styles =
    kind === "success"
      ? "bg-pastel-green-100 border-pastel-green-200 text-pastel-green-700"
      : "bg-rose-50 border-rose-200 text-rose-600";
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${styles}`}
    >
      {message}
    </div>
  );
}
