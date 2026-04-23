import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { getSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Nueva cuenta
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">Crear cuenta</h1>
          <p className="mt-3 text-pastel-blue-500">
            Registra un usuario y activa el acceso desde el correo de verificación.
          </p>
        </header>

        <section className="card p-6 sm:p-8">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
