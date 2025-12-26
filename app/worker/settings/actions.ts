"use server";

import { createClient } from "@/lib/supabase/server";

export type WorkerProfileUpdate = {
  phone: string;
  birth_date: string;
  city: string;
  bank_name: string;
  bank_branch_number: string;
  bank_account_number: string;
  form101_pdf_path: string | null;
};

export async function updateWorkerProfile(update: WorkerProfileUpdate) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("users")
    .update({
      phone: update.phone,
      birth_date: update.birth_date,
      city: update.city,
      bank_name: update.bank_name,
      bank_branch_number: update.bank_branch_number,
      bank_account_number: update.bank_account_number,
      form101_pdf_path: update.form101_pdf_path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return { ok: true };
}

export async function uploadForm101(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Missing file");
  if (file.type !== "application/pdf") throw new Error("Only PDF allowed");

  const fileExt = file.name.split(".").pop() ?? "pdf";
  const filePath = `${user.id}/form101.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("form101") // bucket name
    .upload(filePath, file, { upsert: true, contentType: "application/pdf" });

  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase
    .from("users")
    .update({
      form101_pdf_path: filePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (dbError) throw new Error(dbError.message);

  return { ok: true, filePath };
}