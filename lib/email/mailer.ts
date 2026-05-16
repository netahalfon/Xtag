import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Email transport not configured: EMAIL / EMAIL_PASSWORD missing",
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : to;
  if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
    return { ok: false, error: "No recipients" };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: Array.isArray(recipients) ? undefined : recipients,
      bcc: Array.isArray(recipients) ? recipients : undefined,
      subject,
      text,
    });
    return { ok: true };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.error("[mailer] sendEmail failed:", message);
    return { ok: false, error: message };
  }
}
