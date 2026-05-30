import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Inquiry } from "@/types/inquiry";
import { AdminInquiriesClient } from "./admin-inquiries-client";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: userData, error: userErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userErr || !userData || userData.role !== "admin") redirect("/");

  const { data: inquiries, error: inquiriesErr } = await supabase
    .from("inquiries")
    .select(
      `
      *,
      worker:users!inquiries_worker_id_fkey (
        full_name,
        email,
        phone,
        employee_number
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (inquiriesErr) {
    console.error("❌ Error fetching inquiries:", inquiriesErr.message);
  }

  return (
    <AdminInquiriesClient inquiries={(inquiries ?? []) as Inquiry[]} />
  );
}
