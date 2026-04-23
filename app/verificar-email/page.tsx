import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyEmailToken } from "@/lib/auth/service";

async function verifyAction(formData: FormData): Promise<void> {
  "use server";
  const token = String(formData.get("token") ?? "");
  if (!token) {
    redirect(`/verificar-email?status=error&message=${encodeURIComponent("Token inválido")}`);
  }
  try {
    await verifyEmailToken(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo verificar el correo";
    redirect(`/verificar-email?status=error&message=${encodeURIComponent(message)}`);
  }
  redirect(
    `/verificar-email?status=success&message=${encodeURIComponent(
      "Tu correo fue verificado. Ya puedes iniciar sesión.",
    )}`,
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { status?: string; message?: string; token?: string };
}) {
  const status = searchParams?.status;
  const isResult = status === "success" || status === "error";
  const success = status === "success";
  const token = searchParams?.token;
  const defaultMessage = token
    ? "Pulsa el botón para confirmar la verificación de tu cuenta."
    : "Usa el enlace del correo para completar la verificación de tu cuenta.";
  const message = searchParams?.message || defaultMessage;

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Verificación
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">
            {isResult
              ? success
                ? "Correo verificado"
                : "No se pudo verificar"
              : "Confirma tu correo"}
          </h1>
        </header>

        <section className="card p-6 sm:p-8 space-y-5">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              isResult
                ? success
                  ? "border-pastel-green-200 bg-pastel-green-100 text-pastel-green-700"
                  : "border-rose-200 bg-rose-50 text-rose-600"
                : "border-pastel-blue-200 bg-pastel-blue-50 text-pastel-blue-700"
            }`}
          >
            {message}
          </div>

          {token && !isResult && (
            <form action={verifyAction}>
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn-primary w-full">
                Verificar mi correo
              </button>
            </form>
          )}

          <Link href="/login" className="btn-primary w-full">
            Ir a login
          </Link>
        </section>
      </div>
    </main>
  );
}
