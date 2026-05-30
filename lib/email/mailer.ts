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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toRtlHtml(text: string): string {
  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8"></head><body style="direction:rtl;text-align:right;"><pre style="font-family:Arial,Helvetica,sans-serif;font-size:14px;white-space:pre-wrap;margin:0;direction:rtl;text-align:right;">${escapeHtml(text)}</pre></body></html>`;
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
      html: toRtlHtml(text),
    });
    return { ok: true };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.error("[mailer] sendEmail failed:", message);
    return { ok: false, error: message };
  }
}
