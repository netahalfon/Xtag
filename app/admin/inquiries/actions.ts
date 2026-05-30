"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/mailer";
import { inquiryAnsweredToWorker } from "@/lib/email/templates";
import type { Inquiry } from "@/types/inquiry";

async function assertAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data || data.role !== "admin") {
    throw new Error("Not authorized (admin only)");
  }

  return supabase;
}

export async function updateInquiry(input: {
  id: string;
  response: string;
  status: "open" | "closed";
}): Promise<{ ok: true; inquiry: Inquiry } | { ok: false; error: string }> {
  const supabase = await assertAdmin();

  const newResponse = input.response?.trim() ?? "";

  const { data: existing, error: fetchErr } = await supabase
    .from("inquiries")
    .select("admin_response, responded_at, subject")
    .eq("id", input.id)
    .single();

  if (fetchErr || !existing) {
    return { ok: false, error: fetchErr?.message ?? "פנייה לא נמצאה" };
  }

  const oldResponse = (existing.admin_response ?? "").trim();
  const isFirstResponse = newResponse !== "" && oldResponse === "";

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    admin_response: newResponse === "" ? null : newResponse,
    status: input.status,
    updated_at: now,
  };
  if (isFirstResponse) {
    updates.responded_at = now;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("inquiries")
    .update(updates)
    .eq("id", input.id)
    .select(
      `*, worker:users!inquiries_worker_id_fkey(full_name, email, phone, employee_number)`,
    )
    .single();

  if (updateErr || !updated) {
    return { ok: false, error: updateErr?.message ?? "שגיאה בעדכון" };
  }

  if (isFirstResponse) {
    try {
      const workerEmail = (updated as any).worker?.email as string | undefined;
      if (workerEmail) {
        const { subject, text } = inquiryAnsweredToWorker({
          subject: updated.subject,
          response: newResponse,
        });
        await sendEmail(workerEmail, subject, text);
      }
    } catch (mailErr) {
      console.error("[updateInquiry] notification failed:", mailErr);
    }
  }

  return { ok: true, inquiry: updated as Inquiry };
}
