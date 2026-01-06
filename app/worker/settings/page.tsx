import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkerSettingsClient from "../settings/worker-settings-client";

export default async function WorkerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      `
      email,
      full_name,
      role,
      phone,
      birth_date,
      city,
      id_number,
      bank_name,
      bank_branch_number,
      bank_account_number,
      car_number,
      emergency_contact_name,
      emergency_contact_phone,
      form101_pdf_path
    `
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect("/");

  return <WorkerSettingsClient initialUserData={profile} />;
}
