import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { registered?: string; reset?: string };
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const registered = searchParams?.registered === "1";
  const resetDone = searchParams?.reset === "1";

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Acceso seguro
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">Iniciar sesión</h1>
          <p className="mt-3 text-pastel-blue-500">
            Entra con tu cuenta para registrar y consultar facturas.
          </p>
        </header>

        <section className="card p-6 sm:p-8">
          <LoginForm registered={registered} resetDone={resetDone} />
        </section>
      </div>
    </main>
  );
}
