import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShiftsList } from "./shifts-list";

export default async function WorkerMySalaryPage() {
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

  // ✅ שליפת המשמרות של העובד
  const { data: shifts, error: shiftsErr } = await supabase
    .from("shifts")
    .select("*")
    .eq("worker_id", user.id)
    .order("shift_date", { ascending: false });

  if (shiftsErr) {
    console.error("❌ Error fetching shifts:", shiftsErr.message);
  } else {
    console.log("✅ My shifts:", shifts);
  }

  return (
    <div className="container mt-5">
            <ShiftsList shifts={shifts ?? []} />
    </div>
  );
}
