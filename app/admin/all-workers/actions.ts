"use server"

import { createClient } from "@/lib/supabase/server"
import type { User } from "@/types/user"

async function assertAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !data || data.role !== "admin") throw new Error("Not authorized (admin only)")

  return supabase
}

// ✅ Update user (admin only)
export async function updateUser(updated: User) {
  const supabase = await assertAdmin()

  const { error } = await supabase
    .from("users")
    .update({
      email: updated.email,
      full_name: updated.full_name,
      role: updated.role,
      phone: updated.phone,
      birth_date: updated.birth_date, // string (YYYY-MM-DD) | null
      city: updated.city,
      notes: updated.notes,
      salary_regular: updated.salary_regular,
      salary_manager: updated.salary_manager, // number | null
      form101_pdf_path: updated.form101_pdf_path,
      bank_name: updated.bank_name,
      bank_branch_number: updated.bank_branch_number,
      bank_account_number: updated.bank_account_number,
    })
    .eq("id", updated.id)

  if (error) throw new Error(error.message)

  return { ok: true }
}

// ✅ Delete user (admin only)
export async function deleteUser(userId: string) {
  const supabase = await assertAdmin()

  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) throw new Error(error.message)

  return { ok: true }
}
