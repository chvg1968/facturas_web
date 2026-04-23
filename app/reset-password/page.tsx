import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token ?? "";

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Nueva contraseña
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">
            Restablecer contraseña
          </h1>
        </header>

        <section className="card p-6 sm:p-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                El enlace de recuperación no es válido o no incluye token.
              </div>
              <Link href="/olvide-password" className="btn-primary w-full">
                Solicitar nuevo enlace
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
