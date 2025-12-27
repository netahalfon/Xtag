import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ManagerAddShiftsClient from "./manager-add-shifts-client";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
};

export default async function ManagerAddShiftsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData) {
    redirect("/")
  }

  if (userData.role !== "manager" && userData.role !== "admin") {
    redirect("/worker/my-salary")
  }

  // Fetch users from DB
  const { data, error } = await supabase
    .from("users")
    .select("id,email,full_name")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  const users: UserRow[] = (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
  }));

  console.log("Users:", users);

  return <ManagerAddShiftsClient workers={users} />;
 
}
