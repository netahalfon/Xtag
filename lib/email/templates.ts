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
  shift_pay_total?: number | null;
};

const formatIls = (amount: number) => `₪${amount.toFixed(2)}`;

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
  const lines = [
    `שם האירוע: ${s.event_name ?? "—"}`,
    `תאריך: ${s.shift_date}`,
    `שעות: ${s.start_time}–${s.end_time} (סה"כ ${s.total_hours})`,
    `תפקיד: ${roleHebrew(s.role)}`,
    `מיקום: ${s.location}`,
    `סטטוס: ${statusHebrew(s.status)}`,
  ];
  if (s.shift_pay_total != null) {
    lines.push(`שכר משמרת: ${formatIls(s.shift_pay_total)}`);
  }
  return lines.join("\n");
}

// Task #2
export function shiftSubmittedToWorkers(
  submitterName: string,
  shifts: ShiftLine[],
): { subject: string; text: string } {
  const subject = "Xtag - משמרת חדשה ממתינה לאישור";
  const header = `נשלחה משמרת חדשה על ידי ${submitterName}.`;
  const body = shifts.map(formatShiftBlock).join("\n\n----------\n\n");
  return { subject, text: `${header}\n\nפרטי המשמרת:\n\n${body}\n` };
}

type AdminWorkerLine = {
  full_name: string;
  email: string;
  employee_number: string | null;
  role: "worker" | "manager" | string;
  start_time: string;
  end_time: string;
  total_hours: number;
  notes?: string | null;
  status: string;
  shift_pay_total?: number | null;
};

export type AdminShiftPayload = {
  event_name: string | null;
  shift_date: string;
  location: string;
  team_manager: string;
  workers: AdminWorkerLine[];
};

function joinNonEmptyLines(pairs: Array<[string, string | null | undefined]>) {
  return pairs
    .filter(([, value]) => value != null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

// Task #3
export function shiftSubmittedToAdmin(
  submitterName: string,
  payload: AdminShiftPayload,
): { subject: string; text: string } {
  const subject = "משמרות חדשות ממתינות לאישור";
  const header = `נשלחו משמרות חדשות לאישור על ידי ${submitterName}.`;

  const eventBlock = joinNonEmptyLines([
    ["שם האירוע", payload.event_name],
    ["תאריך", payload.shift_date],
    ["מיקום", payload.location],
    ["שם מנהל הצוות", payload.team_manager],
  ]);

  const workerBlocks = payload.workers
    .map((w, i) => {
      const body = joinNonEmptyLines([
        ["שם", w.full_name],
        ["מייל", w.email],
        ["מספר עובד", w.employee_number],
        ["תפקיד", roleHebrew(w.role)],
        ["שעות עבודה", `${w.start_time}–${w.end_time} (סה"כ ${w.total_hours})`],
        ["שכר משמרת", w.shift_pay_total != null ? formatIls(w.shift_pay_total) : null],
        ["הערה", w.notes],
        ["סטטוס", statusHebrew(w.status)],
      ]);
      return `#${i + 1}\n${body}`;
    })
    .join("\n\n----------\n\n");

  return {
    subject,
    text: `${header}\n\nפרטי המשמרת:\n${eventBlock}\n\nעובדים:\n\n${workerBlocks}\n`,
  };
}

// Task #4
export function shiftApproved(shiftDate: string): {
  subject: string;
  text: string;
} {
  return {
    subject: "Xtag - המשמרת שלך אושרה",
    text: `המשמרת שלך לתאריך ${shiftDate} אושרה בהצלחה.`,
  };
}

// Task #5
export function shiftRejected(shiftDate: string): {
  subject: string;
  text: string;
} {
  return {
    subject: "Xtag - המשמרת שלך נדחתה",
    text: `המשמרת שלך לתאריך ${shiftDate} נדחתה על ידי מנהל המערכת.`,
  };
}

// Inquiries — new submission to admin
export function inquirySubmittedToAdmin(args: {
  workerName: string;
  phone: string | null;
  email: string;
  subject: string;
  content: string;
}): { subject: string; text: string } {
  const lines = [
    `התקבלה פנייה חדשה מ-${args.workerName}.`,
    "",
    "פרטי הפונה:",
    `שם: ${args.workerName}`,
    `מייל: ${args.email}`,
  ];
  if (args.phone?.trim()) {
    lines.push(`טלפון: ${args.phone}`);
  }
  lines.push(
    "",
    `נושא הפנייה: ${args.subject}`,
    "",
    "תוכן הפנייה:",
    args.content,
  );
  return {
    subject: `Xtag - פנייה חדשה מ-${args.workerName}`,
    text: lines.join("\n"),
  };
}

// Inquiries — admin response to worker
export function inquiryAnsweredToWorker(args: {
  subject: string;
  response: string;
}): { subject: string; text: string } {
  return {
    subject: "Xtag - תשובה לפנייתך",
    text: [
      `התקבלה תשובה לפנייתך בנושא "${args.subject}":`,
      "",
      args.response,
    ].join("\n"),
  };
}

// Task #6
export function newEmployeeRegistered(employee: {
  full_name: string;
  id_number: string;
  email: string;
}): { subject: string; text: string } {
  return {
    subject: "עובד חדש נרשם",
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
