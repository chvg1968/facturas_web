"use client";

interface Props {
  loading: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ loading, children }: Props) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin"
        />
      )}
      <span>{loading ? "Guardando…" : children}</span>
    </button>
  );
}
