import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Forms101ViewerClient from "./forms101-viewer-client";

type Worker = {
  id: string;
  email: string;
  full_name: string;
  form101_pdf_path: string | null;
};

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

  const { data: workers } = await supabase
    .from("users")
    .select("id,email,full_name,form101_pdf_path")
    .order("full_name", { ascending: true });

    console.log("workers", workers);

  return <Forms101ViewerClient workers={(workers ?? []) as Worker[]} />;
}
