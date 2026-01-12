import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPayrollReport } from "./actions";
import { PayrollReportClient } from "./payroll-report-client";

// Helper to get previous month
function getPreviousMonth() {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1) // goes back one month safely
  return {
    year: prev.getFullYear(),
    month: prev.getMonth() + 1, // 1–12
  }
}

export default async function Forms101Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // ✅ Admin only
  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!me || me.role !== "admin") redirect("/");

  const { year, month } = getPreviousMonth()

   // Fetch initial data server-side
  const initialRows = await getPayrollReport({ year, month: month });



  return (
    <main className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <PayrollReportClient initialYear={year} initialMonth={month} initialRows={initialRows} />
      </div>
    </main>
  )
}
