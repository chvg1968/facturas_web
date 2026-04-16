import { FacturaForm } from "@/components/FacturaForm";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-pastel-green-700/80">
            Gestión de gastos
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-pastel-blue-700">
            Registro de facturas
          </h1>
          <p className="mt-3 text-pastel-blue-500">
            Ingresa los datos de la factura o gasto. La información se sincroniza con tu tabla de Airtable.
          </p>
        </header>

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
