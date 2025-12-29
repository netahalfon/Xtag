import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AllWorkers } from "./all-workers";

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

return <AllWorkers users={users ?? []} />

}
