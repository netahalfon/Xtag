import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Shift } from "@/types/shifts";
import { AllShifts } from "./all-shifts";

export default async function AdminAllShiftsPage() {
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

  const { data: shifts, error: shiftsErr } = await supabase
    .from("shifts")
    .select(
      `
      *,
      worker:users!shifts_worker_id_fkey (
        full_name,
        email
      )
    `
    )
    .order("shift_date", { ascending: false });

  if (shiftsErr) {
    console.error("❌ Error fetching shifts:", shiftsErr.message);
  }

  const shiftsWithWorker: Shift[] = (shifts ?? []).map((s: any) => ({
    ...s,
    worker_full_name: s.worker?.full_name ?? "",
    worker_email: s.worker?.email ?? "",
  }));

  return <AllShifts shifts={shiftsWithWorker} />;
}
