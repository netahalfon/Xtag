"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkerCombobox } from "./worker-combobox";
import { Card } from "@/components/ui/card";
import {
  Plus,
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createShiftsAction } from "./actions";

type Worker = {
  id: string;
  email: string;
  full_name: string;
};

type AssignedWorker = {
  workerId: string;
  startTime: string;
  endTime: string;
  role: "דייל" | "מנהל" | "";
};

type Props = {
  workers: Worker[];
};

function validateWorkers(list: AssignedWorker[]) {
  const errors: Record<number, string[]> = {};

  list.forEach((aw, i) => {
    const rowErrors: string[] = [];

    if (!aw.workerId) rowErrors.push("יש לבחור עובד");
    if (!aw.startTime) rowErrors.push("יש להזין שעת התחלה");
    if (!aw.endTime) rowErrors.push("יש להזין שעת סיום");
    if (!aw.role) rowErrors.push("יש לבחור תפקיד");

    if (rowErrors.length > 0) {
      errors[i] = rowErrors;
    }
  });

  return errors;
}

export default function ManagerAddShiftsClient({ workers }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ שלב ביניים (מודאל אישור)
  const [showConfirm, setShowConfirm] = useState(false);

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventName, setEventName] = useState("");
  const [teamManager, setTeamManager] = useState("");
  const [assignedWorkers, setAssignedWorkers] = useState<AssignedWorker[]>([
    { workerId: "", startTime: "", endTime: "", role: "" },
  ]);
  const [workerErrors, setWorkerErrors] = useState<Record<number, string[]>>(
    {},
  );

  const addWorker = () => {
    setAssignedWorkers([
      ...assignedWorkers,
      { workerId: "", startTime: "", endTime: "", role: "" },
    ]);
  };

  const removeWorker = (index: number) => {
    if (assignedWorkers.length > 1) {
      setAssignedWorkers(assignedWorkers.filter((_, i) => i !== index));
      setWorkerErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const updateWorker = (
    index: number,
    field: keyof AssignedWorker,
    value: string,
  ) => {
    const updated = [...assignedWorkers];
    updated[index] = { ...updated[index], [field]: value };
    setAssignedWorkers(updated);

    // אופציונלי: מנקה שגיאות של אותה שורה בזמן עריכה
    setWorkerErrors((prev) => {
      if (!prev[index]) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setShowConfirm(false);
    setEventDate("");
    setEventLocation("");
    setEventName("");
    setTeamManager("");
    setAssignedWorkers([
      { workerId: "", startTime: "", endTime: "", role: "" },
    ]);
    setWorkerErrors({});
  };

  // ✅ במקום לשלוח מיד — עושים "בדיקה + פתיחת מודאל"
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateWorkers(assignedWorkers);
    setWorkerErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitError(null);
    setShowConfirm(true);
  };

  // ✅ שליחה אמיתית אחרי אישור במודאל
  const handleConfirmSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createShiftsAction({
        eventDate,
        eventLocation,
        eventName,
        teamManager,
        assignedWorkers,
      });

      setShowConfirm(false);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.message ||
        "שמירת המשמרת נכשלה. בדקי הרשאות / שדות חובה / נסי שוב.";
      setSubmitError(msg);
      setIsSubmitted(false);
      setShowConfirm(false);
      console.error("שגיאה בשמירה:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ מסך הצלחה — מופיע רק אחרי הצלחה אמיתית
  if (isSubmitted) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 p-4 md:p-8 flex items-center justify-center"
      >
        <Card className="max-w-md w-full p-8 border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 shadow-xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-4">
                <CheckCircle2 className="h-16 w-16 text-orange-600 dark:text-orange-400 animate-in zoom-in duration-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                הטופס נשלח בהצלחה!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                המשמרת נוספה בהצלחה למערכת
              </p>
            </div>

            <Button
              onClick={handleReset}
              size="lg"
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
            >
              לשליחת טופס חדש לחץ כאן
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ הטופס (כמו המקורי שלך) + מודאל אישור
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
            {" "}
            הוספת משמרת{" "}
          </h1>
        </div>

        {/* ✅ חיווי שגיאה רק אם נכשל */}
        {submitError && (
          <Card className="mb-6 border-2 border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-700 font-medium">
              ❌ {submitError}
            </div>
          </Card>
        )}

        {/* ✅ שימי לב: onSubmit הוא handleReview (פותח מודאל) */}
        <form onSubmit={handleReview} className="space-y-6">
          {/* Event Details Section (לוק V0) */}
          <Card className="p-6 border-2 border-orange-100 dark:border-orange-900/30 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                פרטי אירוע
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="eventName"
                  className="text-slate-700 dark:text-slate-300"
                >
                  שם האירוע
                </Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="קונצרט קיץ 2024"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="eventDate"
                  className="text-slate-700 dark:text-slate-300"
                >
                  תאריך האירוע
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="eventLocation"
                  className="text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    מיקום האירוע
                  </div>
                </Label>
                <Input
                  id="eventLocation"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="גן סקר, תל אביב"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="teamManager"
                  className="text-slate-700 dark:text-slate-300"
                >
                  שם מנהל הצוות
                </Label>
                <Input
                  id="teamManager"
                  value={teamManager}
                  onChange={(e) => setTeamManager(e.target.value)}
                  placeholder="יוסי כהן"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>

          {/* Assigned Workers Section (לוק V0 + השגיאות שלך) */}
          <Card className="p-6 border-2 border-orange-100 dark:border-orange-900/30 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  עובדים משובצים
                </h2>
              </div>

              <Button
                type="button"
                onClick={addWorker}
                variant="outline"
                size="sm"
                className="border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-transparent"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף עובד
              </Button>
            </div>

            <div className="space-y-4">
              {assignedWorkers.map((assignedWorker, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg border-2 p-4 transition-all",
                    "border-slate-200 dark:border-slate-700",
                    "hover:border-orange-200 dark:hover:border-orange-800",
                    "bg-slate-50 dark:bg-slate-800/50",
                  )}
                >
                  {assignedWorkers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorker(index)}
                      className="absolute left-2 top-2 h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 lg:col-span-2">
                      <WorkerCombobox
                        workers={workers}
                        value={assignedWorker.workerId}
                        onChange={(id) => updateWorker(index, "workerId", id)}
                        disabled={isSubmitting}
                        error={workerErrors[index]?.includes("יש לבחור עובד")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת התחלה
                        </div>
                      </Label>
                      <Input
                        type="time"
                        value={assignedWorker.startTime}
                        onChange={(e) =>
                          updateWorker(index, "startTime", e.target.value)
                        }
                        className={cn(
                          "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900",
                          workerErrors[index]?.includes("יש להזין שעת התחלה") &&
                            "border-red-500 focus-visible:ring-red-500",
                        )}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת סיום
                        </div>
                      </Label>
                      <Input
                        type="time"
                        value={assignedWorker.endTime}
                        onChange={(e) =>
                          updateWorker(index, "endTime", e.target.value)
                        }
                        className={cn(
                          "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900",
                          workerErrors[index]?.includes("יש להזין שעת סיום") &&
                            "border-red-500 focus-visible:ring-red-500",
                        )}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2 lg:col-span-4">
                      <Label className="text-slate-700 dark:text-slate-300">
                        תפקיד
                      </Label>
                      <Select
                        value={assignedWorker.role}
                        onValueChange={(value) =>
                          updateWorker(index, "role", value)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={cn(
                            "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900",
                            workerErrors[index]?.includes("יש לבחור תפקיד") &&
                              "border-red-500 focus:ring-red-500",
                          )}
                        >
                          <SelectValue placeholder="בחר תפקיד" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="דייל">דייל</SelectItem>
                          <SelectItem value="מנהל">מנהל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {workerErrors[index] && (
                    <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-700">
                      {workerErrors[index].map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button (פותח מודאל, לא שולח מיד) */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8"
              disabled={isSubmitting}
            >
              שלח משמרת
            </Button>
          </div>
        </form>

        {/* ✅ Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop (בלי סגירה בלחיצה כדי שיהיה "ברור שחייב לאשר") */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Modal */}
            <div
              dir="rtl"
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 fade-in duration-300"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-orange-100 dark:border-orange-900/30 bg-gradient-to-l from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-500 p-2.5 shadow-lg shadow-orange-500/25">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      אישור משמרת
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      נא לבדוק את הפרטים לפני שליחה
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors",
                    isSubmitting && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Event Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      פרטי אירוע
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-0.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        שם האירוע
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {eventName}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        תאריך
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {eventDate
                          ? new Date(eventDate).toLocaleDateString("he-IL", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> מיקום
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {eventLocation}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        מנהל צוות
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {teamManager}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                {/* Workers Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      עובדים משובצים ({assignedWorkers.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {assignedWorkers.map((aw, index) => {
                      const worker = workers.find((w) => w.id === aw.workerId);

                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-xs shrink-0 shadow-md shadow-orange-500/20">
                              {worker?.full_name?.charAt(0) ?? "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                {worker?.full_name ?? "לא נבחר"}
                              </span>
                              {!!worker?.email && (
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Mail className="h-3 w-3" />
                                  {worker.email}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                              <Briefcase className="h-3 w-3" />
                              {aw.role || "—"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              <Clock className="h-3 w-3" />
                              {aw.startTime || "—"} - {aw.endTime || "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t-2 border-orange-100 dark:border-orange-900/30 bg-white dark:bg-slate-900 px-6 py-4 rounded-b-2xl">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent"
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  חזרה לעריכה
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 shadow-lg shadow-orange-500/25"
                >
                  <ShieldCheck className="h-4 w-4 ml-2" />
                  {isSubmitting ? "שולח..." : "אישור ושליחה"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ); 
}
