import { redirect } from "next/navigation";
import { FacturaForm } from "@/components/FacturaForm";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <header className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
              Gestión de gastos
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-pastel-blue-700">
              Registro de facturas
            </h1>
            <p className="mt-3 text-pastel-blue-500">
              {session.nombre}, ingresa los datos de la factura o gasto. La información se sincroniza con tu tabla de Airtable.
            </p>
          </header>
          <div className="flex justify-center sm:justify-end">
            <LogoutButton />
          </div>
        </div>

        <section className="card p-6 sm:p-8">
          <FacturaForm />
        </section>

        <footer className="mt-8 text-center text-xs text-pastel-blue-500/80">
          Diseño sobrio · Datos seguros · Sincronización con Airtable
        </footer>
      </div>
    </main>
  );
}
