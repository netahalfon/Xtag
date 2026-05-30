export type Inquiry = {
  id: string;
  worker_id: string;
  subject: string;
  content: string;
  status: "open" | "closed";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;

  worker?: {
    full_name: string;
    email: string;
    phone: string;
    employee_number: string | null;
  } | null;
};
