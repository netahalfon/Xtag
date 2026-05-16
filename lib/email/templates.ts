import "server-only";

type ShiftLine = {
  worker_name: string;
  event_name: string | null;
  shift_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  role: "worker" | "manager" | string;
  location: string;
  notes?: string | null;
  status: string;
};

const roleHebrew = (role: string) =>
  role === "manager" ? "מנהל" : role === "worker" ? "דייל" : role;

const statusHebrew = (status: string) => {
  switch (status) {
    case "pending":
      return "ממתין לאישור";
    case "approved":
      return "מאושר";
    case "rejected":
      return "נדחה";
    default:
      return status;
  }
};

function formatShiftBlock(s: ShiftLine): string {
  return [
    `שם האירוע: ${s.event_name ?? "—"}`,
    `תאריך: ${s.shift_date}`,
    `שעות: ${s.start_time}–${s.end_time} (סה"כ ${s.total_hours})`,
    `תפקיד: ${roleHebrew(s.role)}`,
    `מיקום: ${s.location}`,
    `הערות: ${s.notes?.trim() ? s.notes : "—"}`,
    `סטטוס: ${statusHebrew(s.status)}`,
  ].join("\n");
}

// Task #2
export function shiftSubmittedToWorkers(
  submitterName: string,
  shifts: ShiftLine[],
): { subject: string; text: string } {
  const subject = "New Shift Pending Approval";
  const header = `נשלחה משמרת חדשה על ידי ${submitterName}.`;
  const body = shifts.map(formatShiftBlock).join("\n\n----------\n\n");
  return { subject, text: `${header}\n\nפרטי המשמרת:\n\n${body}\n` };
}

// Task #3
export function shiftSubmittedToAdmin(
  submitterName: string,
  shifts: ShiftLine[],
): { subject: string; text: string } {
  const subject = "New Shifts Waiting for Approval";
  const header = `נשלחו משמרות חדשות לאישור על ידי ${submitterName}.`;
  const lines = shifts.map(
    (s, i) =>
      `#${i + 1} ${s.worker_name} — ${s.shift_date} ${s.start_time}–${s.end_time} (${roleHebrew(
        s.role,
      )}) — ${statusHebrew(s.status)}`,
  );
  const detailed = shifts.map(formatShiftBlock).join("\n\n----------\n\n");
  return {
    subject,
    text: `${header}\n\nסיכום:\n${lines.join("\n")}\n\nפירוט:\n\n${detailed}\n`,
  };
}

// Task #4
export function shiftApproved(shiftDate: string): {
  subject: string;
  text: string;
} {
  return {
    subject: "Your Shift Was Approved",
    text: `המשמרת שלך לתאריך ${shiftDate} אושרה בהצלחה.`,
  };
}

// Task #5
export function shiftRejected(shiftDate: string): {
  subject: string;
  text: string;
} {
  return {
    subject: "Your Shift Was Rejected",
    text: `המשמרת שלך לתאריך ${shiftDate} נדחתה על ידי מנהל המערכת.`,
  };
}

// Task #6
export function newEmployeeRegistered(employee: {
  full_name: string;
  id_number: string;
  email: string;
}): { subject: string; text: string } {
  return {
    subject: "New Employee Registered",
    text: [
      "עובד חדש נרשם בהצלחה.",
      "",
      "פרטי העובד:",
      `שם מלא: ${employee.full_name}`,
      `תעודת זהות: ${employee.id_number}`,
      `אימייל: ${employee.email}`,
    ].join("\n"),
  };
}
