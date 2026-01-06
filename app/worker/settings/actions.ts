"use server";

import { createClient } from "@/lib/supabase/server";

export type WorkerProfileUpdate = {
  phone: string;
  birth_date: string;
  city: string;

  bank_name: string;
  bank_branch_number: string;
  bank_account_number: string;

  car_number: string | null;

  emergency_contact_name: string;
  emergency_contact_phone: string;

  form101_pdf_path: string | null;
};

export async function updateWorkerProfile(update: WorkerProfileUpdate) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

const payload = {
  phone: update.phone,
  birth_date: update.birth_date,
  city: update.city,

  bank_name: update.bank_name,
  bank_branch_number: update.bank_branch_number,
  bank_account_number: update.bank_account_number,

  car_number: update.car_number,

  emergency_contact_name: update.emergency_contact_name,
  emergency_contact_phone: update.emergency_contact_phone,

  form101_pdf_path: update.form101_pdf_path,
};


  const { error } = await supabase
    .from("users")
    .update(payload)
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
  const year = new Date().getFullYear();
  const filePath = `${year}/${user.id}/form101.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("forms101") // bucket name
    .upload(filePath, file, { upsert: true, contentType: "application/pdf" });

  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase
    .from("users")
    .update({
      form101_pdf_path: filePath,
    })
    .eq("id", user.id);

  if (dbError) throw new Error(dbError.message);

  return { ok: true, filePath };
}
