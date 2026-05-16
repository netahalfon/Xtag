"use server";

import { sendEmail } from "@/lib/email/mailer";
import { newEmployeeRegistered } from "@/lib/email/templates";

export async function notifyTamuzNewEmployee(employee: {
  full_name: string;
  id_number: string;
  email: string;
}) {
  const tamuzEmail = process.env.ADMIN_EMAIL;
  if (!tamuzEmail) {
    console.error("[notifyTamuzNewEmployee] ADMIN_EMAIL not configured");
    return { ok: false };
  }

  const { subject, text } = newEmployeeRegistered(employee);
  return sendEmail(tamuzEmail, subject, text);
}
