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

- **fullName** (string)  
  Full name of the employee.

- **phone** (string)  
  Contact phone number.

- **email** (string)  
  User email (linked to Supabase Auth).

- **birthDate** (string, YYYY-MM-DD)  
  Date of birth.

- **idNumber** (string)  
  Government ID number.

- **city** (string)  
  City of residence.

- **notes** (string, optional)  
  Internal notes about the employee.

- **salaryRegular** (number)  
  Hourly salary for a regular worker.

- **salaryManager** (number)  
  Hourly salary when acting as a manager.

- **role** (UserRole)  
  User role in the system (`worker` / `manager` / `admin`).  
  This field is controlled by the database and protected by RLS.

- **form101PdfUrl** (string, optional)  
  URL to the uploaded Form 101 PDF.

- **bankBranchNumber** (string)  
  Bank branch number.

- **bankAccountNumber** (string)  
  Bank account number.

---

## Shifts Schema

The `shifts` schema stores all work shift data and salary calculations.

### Shift Fields

- **employeeId**  
  ID of the employee (FK → users).

- **employeeName**  
  Full name of the employee.

- **date**  
  Shift date.

- **location**  
  Work location.

- **startTime**  
  Shift start time.

- **endTime**  
  Shift end time.

- **role**  
  Role during the shift (`worker` / `manager`).

- **shiftManager**  
  Name or ID of the shift manager.

- **hourlySalary**  
  Salary per hour for this shift.

- **extras**  
  Additional payments or bonuses.

- **finalSalary**  
  Final calculated salary, including travel expenses.

---

## Security Notes

- User roles are **not controlled by the client**.
- All role changes are restricted via **Row Level Security (RLS)**.
- Shift data access is scoped according to user role and permissions.

---

