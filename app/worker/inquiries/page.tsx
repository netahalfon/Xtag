import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Inquiry } from "@/types/inquiry";
import { WorkerInquiriesClient } from "./worker-inquiries-client";

export default async function WorkerInquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData, error: userErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userErr || !userData) {
    redirect("/");
  }

  const { data: inquiries, error: inquiriesErr } = await supabase
    .from("inquiries")
    .select("*")
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  if (inquiriesErr) {
    console.error("❌ Error fetching inquiries:", inquiriesErr.message);
  }

  return (
    <WorkerInquiriesClient inquiries={(inquiries ?? []) as Inquiry[]} />
  );
}
