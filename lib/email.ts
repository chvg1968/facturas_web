import { Resend } from "resend";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

function getBaseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("Falta RESEND_FROM_EMAIL");
  }
  return from;
}

export async function sendVerificationEmail(input: {
  email: string;
  nombre: string;
  token: string;
}): Promise<void> {
  const resend = getResend();
  const verificationUrl = `${getBaseUrl()}/verificar-email?token=${encodeURIComponent(input.token)}`;

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: input.email,
    subject: "Verifica tu correo",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f3b5b;">
        <h2>Verifica tu correo</h2>
        <p>Hola ${input.nombre || "usuario"},</p>
        <p>Confirma tu cuenta para activar el acceso a facturas-web.</p>
        <p>
          <a
            href="${verificationUrl}"
            style="display:inline-block;padding:12px 18px;background:#3f7cac;color:#ffffff;text-decoration:none;border-radius:8px;"
          >
            Verificar correo
          </a>
        </p>
        <p>Si el botón no funciona, copia este enlace en tu navegador:</p>
        <p>${verificationUrl}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(input: {
  email: string;
  nombre: string;
  token: string;
}): Promise<void> {
  const resend = getResend();
  const resetUrl = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(input.token)}`;

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: input.email,
    subject: "Restablece tu contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f3b5b;">
        <h2>Restablece tu contraseña</h2>
        <p>Hola ${input.nombre || "usuario"},</p>
        <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
        <p>
          <a
            href="${resetUrl}"
            style="display:inline-block;padding:12px 18px;background:#3f7cac;color:#ffffff;text-decoration:none;border-radius:8px;"
          >
            Crear nueva contraseña
          </a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Si el botón no funciona, copia este enlace en tu navegador:</p>
        <p>${resetUrl}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend password reset email: ${error.message}`);
  }
}
