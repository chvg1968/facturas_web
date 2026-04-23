import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { status?: string; message?: string };
}) {
  const success = searchParams?.status === "success";
  const message =
    searchParams?.message ||
    "Usa el enlace del correo para completar la verificación de tu cuenta.";

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Verificación
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">
            {success ? "Correo verificado" : "No se pudo verificar"}
          </h1>
        </header>

        <section className="card p-6 sm:p-8 space-y-5">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              success
                ? "border-pastel-green-200 bg-pastel-green-100 text-pastel-green-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {message}
          </div>

          <Link href="/login" className="btn-primary w-full">
            Ir a login
          </Link>
        </section>
      </div>
    </main>
  );
}
