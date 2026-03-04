"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Save, X } from "lucide-react";
import type { Shift } from "@/types/shift";

const roleLabels: Record<Shift["role"], string> = {
  worker: "עובד",
  manager: "מנהל",
};

const statusLabels: Record<Shift["status"], string> = {
  pending: "ממתין",
  approved: "מאושר",
  rejected: "נדחה",
};

const statusStyles: Record<Shift["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

interface ShiftDetailPanelProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shift: Shift) => void;
}

export function ShiftDetailPanel({
  shift,
  open,
  onOpenChange,
  onSave,
}: ShiftDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedShift, setEditedShift] = useState<Shift | null>(null);

  useEffect(() => {
    if (shift) {
      setEditedShift({ ...shift });
      setIsEditing(false);
    }
  }, [shift]);

  if (!shift || !editedShift) return null;

  const displayShift = isEditing ? editedShift : shift;

  const workerName = displayShift.worker?.full_name || "לא ידוע";
  const employeeNumber = displayShift.worker?.employee_number || "---";

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const totalMinutes = endMinutes - startMinutes;
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  const calculateShiftPayTotal = (
    totalHours: number,
    hourlyRate: number,
    wageBonus: number,
    travelAmount: number,
  ): number => {
    if (totalHours <= 8) {
      return totalHours * hourlyRate + wageBonus + travelAmount;
    } else if (totalHours > 8 && totalHours <= 10) {
      return (
        totalHours * hourlyRate +
        (totalHours - 8) * hourlyRate * 0.25 +
        wageBonus +
        travelAmount
      );
    } else {
      return (
        totalHours * hourlyRate +
        2 * hourlyRate * 0.25 +
        (totalHours - 10) * hourlyRate * 0.5 +
        wageBonus +
        travelAmount
      );
    }
  };

  const handleFieldChange = (field: keyof Shift, value: string | number) => {
    if (!editedShift) return;

    const updatedShift = { ...editedShift, [field]: value };

    if (field === "start_time" || field === "end_time") {
      const totalHours = calculateTotalHours(
        updatedShift.start_time,
        updatedShift.end_time,
      );
      updatedShift.total_hours = totalHours;
      updatedShift.shift_pay_total = calculateShiftPayTotal(
        totalHours,
        updatedShift.hourly_rate,
        updatedShift.wage_bonus,
        updatedShift.travel_amount,
      );
    } else if (
      field === "hourly_rate" ||
      field === "wage_bonus" ||
      field === "travel_amount"
    ) {
      updatedShift.shift_pay_total = calculateShiftPayTotal(
        updatedShift.total_hours,
        updatedShift.hourly_rate,
        updatedShift.wage_bonus,
        updatedShift.travel_amount,
      );
    }

    setEditedShift(updatedShift);
  };

  const handleSave = () => {
    if (!editedShift) return;
    onSave(editedShift);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedShift({ ...shift });
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-lg w-full overflow-y-auto">
        <div dir="rtl" className="flex flex-col h-full">
          <SheetHeader className="border-b pb-1">
            <SheetTitle className="text-xl">פרטי משמרת</SheetTitle>
            <SheetDescription>
              {displayShift.event_name} -{" "}
              {new Date(displayShift.shift_date).toLocaleDateString("he-IL")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="flex flex-col gap-2">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  סטטוס
                </span>
                {isEditing ? (
                  <Select
                    dir="rtl"
                    value={editedShift.status}
                    onValueChange={(value) =>
                      handleFieldChange("status", value)
                    }
                  >
                    <SelectTrigger className="w-32 border-orange-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="approved">מאושר</SelectItem>
                      <SelectItem value="rejected">נדחה</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[displayShift.status]}`}
                  >
                    {statusLabels[displayShift.status]}
                  </span>
                )}
              </div>

              <hr className="border-gray-400" />

              {/* Event Details */}
              <h3 className="text-sm font-semibold text-foreground">
                פרטי האירוע
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    שם הכנס
                  </Label>
                  <p className="text-sm text-foreground">
                    {displayShift.event_name}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">מיקום</Label>
                  <p className="text-sm text-foreground">
                    {displayShift.location}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">תאריך</Label>
                  <p className="text-sm text-foreground">
                    {new Date(displayShift.shift_date).toLocaleDateString(
                      "he-IL",
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    מנהל המשמרת
                  </Label>
                  <p className="text-sm text-foreground">
                    {displayShift.manager}
                  </p>
                </div>
              </div>

              <hr className="border-gray-400" />

              {/* Worker Details */}
              <h3 className="text-sm font-semibold text-foreground">
                פרטי העובד
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    שם מלא
                  </Label>
                  <p className="text-sm text-foreground">{workerName}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    מספר עובד
                  </Label>
                  <p className="text-sm text-foreground">{employeeNumber}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">תפקיד</Label>
                  {isEditing ? (
                    <Select
                      dir="rtl"
                      value={editedShift.role}
                      onValueChange={(value) =>
                        handleFieldChange("role", value)
                      }
                    >
                      <SelectTrigger className="border-orange-300 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="worker">עובד</SelectItem>
                        <SelectItem value="manager">מנהל</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex w-fit items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      {roleLabels[displayShift.role]}
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-gray-400" />

              {/* Time & Pay */}
              <h3 className="text-sm font-semibold text-foreground">
                שעות ותשלום
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    שעת התחלה
                  </Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedShift.start_time}
                      onChange={(e) =>
                        handleFieldChange("start_time", e.target.value)
                      }
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {displayShift.start_time}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    שעת סיום
                  </Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedShift.end_time}
                      onChange={(e) =>
                        handleFieldChange("end_time", e.target.value)
                      }
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {displayShift.end_time}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    {'סה"כ שעות'}
                  </Label>
                  <p className="text-sm text-foreground font-medium">
                    {displayShift.total_hours.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    שכר שעתי
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedShift.hourly_rate}
                      onChange={(e) =>
                        handleFieldChange("hourly_rate", Number(e.target.value))
                      }
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {"₪"}
                      {displayShift.hourly_rate}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">בונוס</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedShift.wage_bonus}
                      onChange={(e) =>
                        handleFieldChange("wage_bonus", Number(e.target.value))
                      }
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {"₪"}
                      {displayShift.wage_bonus}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    החזר נסיעות
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedShift.travel_amount}
                      onChange={(e) =>
                        handleFieldChange(
                          "travel_amount",
                          Number(e.target.value),
                        )
                      }
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {"₪"}
                      {displayShift.travel_amount}
                    </p>
                  )}
                </div>
              </div>

              <hr className="border-gray-400" />

              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-sm font-semibold text-foreground">
                  {'סה"כ משכורת'}
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {"₪"}
                  {displayShift.shift_pay_total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-2 flex-row gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Save className="h-4 w-4 ml-2" />
                  שמור שינויים
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  ביטול
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                עריכת משמרת
              </Button>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
