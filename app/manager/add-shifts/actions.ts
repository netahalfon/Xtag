"use server";

import { createClient } from "@/lib/supabase/server";

type AssignedWorker = {
  workerId: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  role: "דייל" | "מנהל" | "";
};

type CreateShiftsInput = {
  eventDate: string; // "YYYY-MM-DD"
  eventLocation: string;
  eventName: string;
  teamManager: string;
  assignedWorkers: AssignedWorker[];
};

function calcTotalHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;

  if (endMin < startMin) endMin += 24 * 60;

  return Number(((endMin - startMin) / 60).toFixed(2));
}

// Calculate total pay (OT rules)
const calculateShiftPayTotal = (
  totalHours: number,
  hourlyRate: number,
  wageBonus: number,
  travelAmount: number
): number => {
  if (totalHours <= 8) {
    return totalHours * hourlyRate + wageBonus + travelAmount;
  } else if (totalHours > 8 && totalHours <= 10) {
    return (
      totalHours * hourlyRate +
      (totalHours - 8) * hourlyRate * 0.25 +
      wageBonus +
      travelAmount
    );
  } else {
    return (
      totalHours * hourlyRate +
      2 * hourlyRate * 0.25 +
      (totalHours - 10) * hourlyRate * 0.5 +
      wageBonus +
      travelAmount
    );
  }
};

export async function createShiftsAction(input: CreateShiftsInput) {
  const supabase = await createClient();

  // Optional auth guard (keep if you want)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  if (!input.eventDate || !input.eventLocation || !input.teamManager) {
    throw new Error("Missing event fields");
  }

  const validWorkers = input.assignedWorkers.filter(
    (aw) => aw.workerId && aw.startTime && aw.endTime && aw.role
  );

  if (validWorkers.length === 0) {
    throw new Error("No valid assigned workers");
  }

  // 1) Fetch salaries from DB for the selected workerIds
  const workerIds = Array.from(new Set(validWorkers.map((w) => w.workerId)));

  const { data: usersData, error: usersErr } = await supabase
    .from("users")
    .select("id, salary_regular, salary_manager")
    .in("id", workerIds);

  if (usersErr) throw new Error(usersErr.message);

  const salaryById = new Map(
    (usersData ?? []).map((u: any) => [
      u.id,
      {
        salary_regular: Number(u.salary_regular ?? 0),
        salary_manager: Number(u.salary_manager ?? 0),
      },
    ])
  );

  // 2) Build shift rows
  const wageBonusDefault = 0;
  const travelAmountDefault = 25;

  const rows = validWorkers.map((aw) => {
    const dbRole = aw.role === "מנהל" ? "manager" : "worker";
    const salary = salaryById.get(aw.workerId);

    if (!salary) {
      throw new Error(`Worker not found in users table: ${aw.workerId}`);
    }

    const hourlyRate =
      aw.role === "מנהל" ? salary.salary_manager : salary.salary_regular;

    if (hourlyRate <= 0) {
      throw new Error(
        `Missing/invalid hourly rate for worker ${aw.workerId} (role: ${aw.role})`
      );
    }

    const totalHours = calcTotalHours(aw.startTime, aw.endTime);

    const wageBonus = wageBonusDefault;
    const travelAmount = travelAmountDefault;

    const shiftPayTotal = Number(
      calculateShiftPayTotal(
        totalHours,
        hourlyRate,
        wageBonus,
        travelAmount
      ).toFixed(2)
    );

    return {
      shift_date: input.eventDate,
      location: input.eventLocation,
      event_name: input.eventName || null,
      manager: input.teamManager,

      worker_id: aw.workerId,
      role: dbRole,

      start_time: aw.startTime,
      end_time: aw.endTime,

      total_hours: totalHours,
      hourly_rate: hourlyRate,
      wage_bonus: wageBonus,
      travel_amount: travelAmount,
      shift_pay_total: shiftPayTotal,

      status: "draft",
    };
  });

  const { error: insertErr } = await supabase.from("shifts").insert(rows);
  if (insertErr) throw new Error(insertErr.message);

  return { ok: true, inserted: rows.length };
}
