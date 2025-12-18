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

  if (!userData || userData.role !== "admin") {
    redirect("/")
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
