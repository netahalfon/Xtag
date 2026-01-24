export type User = {
  id: string

  email: string
  full_name: string
  role: "admin" | "manager" | "worker"

  created_at: string

  phone: string
  birth_date: string | null
  city: string
  notes: string

  salary_regular: number
  salary_manager: number | null

  bank_name: string
  bank_branch_number: string
  bank_account_number: string

  // 🔹 NEW FIELDS
  id_number: string
  car_number: string | null
  emergency_contact_name: string
  emergency_contact_phone: string

  form101_pdf_path: string
}
