"use server";

import type { PayrollRow } from "./payroll-report-client";
import { createClient } from "@/lib/supabase/server";

// The exact row shape returned from the RPC function
type PayrollReportRpcRow = {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  id_number: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_branch_number: string | null;
  amount_to_pay: number | string | null;
  travel_sum: number | string | null;
  total_sum: number | string | null;
};

function getMonthRange(year: number, month: number) {
  // month: 1–12
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));

  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  return {
    from_date: toDate(from),
    to_date: toDate(to),
  };
}

export async function getPayrollReport({
  year,
  month,
}: {
  year: number;
  month: number;
}): Promise<PayrollRow[]> {
  const supabase = await createClient();
  const { from_date, to_date } = getMonthRange(year, month);

  const { data, error } = await supabase.rpc("payroll_report", {
    from_date,
    to_date,
  });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as PayrollReportRpcRow[];

  return rows.map((row) => ({
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    bankDetails: `בנק: ${row.bank_name ?? ""} | סניף: ${
      row.bank_branch_number ?? ""
    } | חשבון: ${row.bank_account_number ?? ""}`,
    amountToPay: Number(row.amount_to_pay ?? 0),
    travelSum: Number(row.travel_sum ?? 0),
    totalSum: Number(row.total_sum ?? 0),
  }));
}
