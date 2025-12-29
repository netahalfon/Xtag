import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminAllWorkersPage() {
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

  // ✅ Fetch all users (all columns)
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersErr) {
    console.error("❌ Error fetching users:", usersErr.message);
  } else {
    console.log("✅ All users:", users);
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h1 className="card-title display-4 mb-3">All Workers</h1>
              <p className="lead text-muted">
                Check the server console logs ✅
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
