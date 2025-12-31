

export type Shift = {
  id: string
  shift_date: string
  event_name: string
  location: string
  manager: string
  worker_id: string
  role: "worker" | "manager"
  start_time: string
  end_time: string
  total_hours: number
  hourly_rate: number
  wage_bonus: number
  travel_amount: number
  shift_pay_total: number
  status: "draft" | "submitted" | "approved" | "paid" | "cancelled"
  created_at: string
  updated_at: string
  worker: { full_name: string; email: string }
  worker_full_name: string
  worker_email: string
}
