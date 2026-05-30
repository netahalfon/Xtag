"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/mailer";
import { inquirySubmittedToAdmin } from "@/lib/email/templates";
import type { Inquiry } from "@/types/inquiry";

export async function createInquiry(input: {
  subject: string;
  content: string;
}): Promise<{ ok: true; inquiry: Inquiry } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "Not authenticated" };
  }

  const subject = input.subject?.trim() ?? "";
  const content = input.content?.trim() ?? "";

  if (subject.length < 3) {
    return { ok: false, error: "נושא חייב להכיל לפחות 3 תווים" };
  }
  if (content.length < 10) {
    return { ok: false, error: "תוכן חייב להכיל לפחות 10 תווים" };
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("inquiries")
    .insert({
      worker_id: user.id,
      subject,
      content,
      status: "open",
    })
    .select("*")
    .single();

  if (insertErr || !inserted) {
    return { ok: false, error: insertErr?.message ?? "שגיאה בשמירה" };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();

      const workerName =
        profile?.full_name?.trim() || profile?.email || "משתמש";

      const { subject: emailSubject, text } = inquirySubmittedToAdmin({
        workerName,
        phone: profile?.phone ?? null,
        email: profile?.email ?? user.email ?? "",
        subject,
        content,
      });
      await sendEmail(adminEmail, emailSubject, text);
    }
  } catch (mailErr) {
    console.error("[createInquiry] notification failed:", mailErr);
  }

  return { ok: true, inquiry: inserted as Inquiry };
}
