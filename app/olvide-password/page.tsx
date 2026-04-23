import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Recuperación
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-pastel-blue-700">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-3 text-pastel-blue-500">
            Te enviaremos un enlace para restablecer el acceso a tu cuenta.
          </p>
        </header>

        <section className="card p-6 sm:p-8">
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
