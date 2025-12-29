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

  form101_pdf_path: string
}
