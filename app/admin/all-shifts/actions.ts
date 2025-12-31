"use server";

import { createClient } from "@/lib/supabase/server";
import type { Shift } from "@/types/shift";

async function assertAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("❌ assertAdmin: Not authenticated");
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data || data.role !== "admin") {
    console.error("❌ assertAdmin: Not authorized", {
      userId: user.id,
      role: data?.role,
    });
    throw new Error("Not authorized (admin only)");
  }

  console.log("✅ assertAdmin: Authorized admin", user.id);
  return supabase;
}

// ✅ Update shift (admin only)
export async function updateShift(updated: Shift) {
  console.log("🟡 updateShift: START", {
    shiftId: updated.id,
  });

  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("shifts")
    .update({
      shift_date: updated.shift_date,
      event_name: updated.event_name,
      location: updated.location,
      manager: updated.manager,
      role: updated.role,
      start_time: updated.start_time,
      end_time: updated.end_time,
      total_hours: updated.total_hours,
      hourly_rate: updated.hourly_rate,
      wage_bonus: updated.wage_bonus,
      travel_amount: updated.travel_amount,
      shift_pay_total: updated.shift_pay_total,
      status: updated.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updated.id);

  if (error) {
    console.error("❌ updateShift: FAILED", {
      shiftId: updated.id,
      error: error.message,
    });
    throw new Error(error.message);
  }

  console.log("✅ updateShift: SUCCESS", {
    shiftId: updated.id,
  });

  return { ok: true };
}

// ✅ Delete shift (admin only)
export async function deleteShift(shiftId: string) {
  console.log("🟡 deleteShift: START", { shiftId });

  const supabase = await assertAdmin();

  const { error } = await supabase.from("shifts").delete().eq("id", shiftId);

  if (error) {
    console.error("❌ deleteShift: FAILED", {
      shiftId,
      error: error.message,
    });
    throw new Error(error.message);
  }

  console.log("✅ deleteShift: SUCCESS", { shiftId });

  return { ok: true };
}
