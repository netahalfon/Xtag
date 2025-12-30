import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminAllShiftsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || !userData || userData.role !== "admin") {
    redirect("/")
  }


// select shift + worker (name+email)
const { data: shifts, error: shiftsErr } = await supabase
  .from("shifts")
  .select(`
    *,
    worker:users!shifts_worker_id_fkey (
      full_name,
      email
    )
  `)
  .order("shift_date", { ascending: false })

if (shiftsErr) {
  console.error("❌ Error fetching shifts:", shiftsErr.message)
} else {
  // ✅ מערך שטוח: כל משמרת + שם+אימייל
  const shiftsWithWorker = (shifts ?? []).map((s) => ({
    ...s,
    worker_full_name: s.worker?.full_name ?? "",
    worker_email: s.worker?.email ?? "",
  }))

  console.log("✅ All shifts with worker:", shiftsWithWorker)
}


  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h1 className="card-title display-4 mb-3">All Shifts</h1>
              <p className="lead text-muted">??? Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
