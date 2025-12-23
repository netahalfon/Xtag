# Xtag – Data Schemas Overview

This project is built with a clear separation between authentication (Supabase Auth)  
and application data (custom database schemas).

Below is an overview of the main schemas used in the system.

---

## Users Schema

The `users` schema stores all application-level user data.
Authentication (login, password, email verification) is handled by Supabase Auth,
while roles and business logic are managed here.

### User Fields

- **id** (uuid)  
  Unique identifier of the user (linked to `auth.users.id`).

- **email** (text)  
  User email address (managed by Supabase Auth).

- **full_name** (text)  
  Official full name of the employee.  
  Used for payroll and official documents.  
  Editable by admin only.

- **role** (text)  
  User role in the system (`worker`, `manager`, `admin`).  
  Controlled by the database and protected by RLS.

- **created_at** (timestamptz)  
  Timestamp of user creation.

- **phone** (text)  
  Contact phone number.

- **birth_date** (date)  
  Employee date of birth.

- **city** (text)  
  City of residence.

- **notes** (text)  
  Internal administrative notes.  
  Visible and editable by admin only.

- **salary_regular** (numeric)  
  Hourly salary when working as a regular employee.  
  Admin only.

- **salary_manager** (numeric)  
  Hourly salary when working as a manager.  
  Admin only.

- **form101_pdf_path** (text)  
  Path to the employee’s Form 101 PDF stored in Supabase Storage.  
  The file is private and accessed via signed URLs.

- **bank_name** (text)  
  Name of the employee’s bank.

- **bank_branch_number** (text)  
  Bank branch number.

- **bank_account_number** (text)  
  Bank account number.

---

## Shifts Schema

The `shifts` schema stores all work shifts and salary calculation data.
Each shift is linked to a specific employee using the user UUID.

### Shift Fields

- **employee_id**  
  ID of the employee (FK → `users.id`).

- **employee_name**  
  Employee name at the time of the shift (for display and reporting).

- **date**  
  Shift date.

- **location**  
  Work location.

- **start_time**  
  Shift start time.
