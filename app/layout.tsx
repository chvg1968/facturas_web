import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facturas · Registro",
  description: "Registro sobrio y elegante de facturas y gastos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
