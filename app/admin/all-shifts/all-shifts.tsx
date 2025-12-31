"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Edit2, Save, Trash2 } from "lucide-react";
import { Shift } from "@/types/shifts";

const roleLabels: Record<Shift["role"], string> = {
  worker: "עובד",
  manager: "מנהל",
};

interface AllShiftsProps {
  shifts: Shift[];
}

export function AllShifts({ shifts: initialShifts }: AllShiftsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedShift, setEditedShift] = useState<Shift | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  // Filter shifts by worker name, email, or event name
  const filteredShifts = shifts.filter((shift) => {
    const workerName = shift.worker_full_name || shift.worker?.full_name || "";
    const workerEmail = shift.worker_email || shift.worker?.email || "";
    const query = searchQuery.toLowerCase();
    return (
      workerName.toLowerCase().includes(query) ||
      workerEmail.toLowerCase().includes(query) ||
      shift.event_name.toLowerCase().includes(query)
    );
  });

  // Calculate total hours from start and end time
  const calculateTotalHours = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const totalMinutes = endMinutes - startMinutes;
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  // Calculate total pay
  const calculateShiftPayTotal = (
    totalHours: number,
    hourlyRate: number,
    wageBonus: number,
    travelAmount: number
  ): number => {
    return totalHours * hourlyRate + wageBonus + travelAmount;
  };

  const handleEdit = (shift: Shift) => {
    setEditingId(shift.id);
    setEditedShift({ ...shift });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedShift(null);
  };

  const handleFieldChange = (field: keyof Shift, value: string | number) => {
    if (!editedShift) return;

    const updatedShift = { ...editedShift, [field]: value };

    // Recalculate when time or rate fields change
    if (field === "start_time" || field === "end_time") {
      const totalHours = calculateTotalHours(
        updatedShift.start_time,
        updatedShift.end_time
      );
      updatedShift.total_hours = totalHours;
      updatedShift.shift_pay_total = calculateShiftPayTotal(
        totalHours,
        updatedShift.hourly_rate,
        updatedShift.wage_bonus,
        updatedShift.travel_amount
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
        updatedShift.travel_amount
      );
    }

    setEditedShift(updatedShift);
  };

  const handleSave = async () => {
    if (!editedShift) return;

    // TODO: Call server API to update shift
    // await updateShift(editedShift)

    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === editedShift.id ? editedShift : shift
      )
    );
    setEditingId(null);
    setEditedShift(null);
  };

  const handleDeleteClick = (shiftId: string) => {
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return;

    // TODO: Call server API to delete shift
    // await deleteShift(shiftToDelete)

    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.id !== shiftToDelete)
    );
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-[1800px]">
        <h1 className="mb-8 text-3xl font-bold text-black">כל המשמרות</h1>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="חיפוש לפי שם עובד, אימייל, או שם כנס..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Shifts Table */}
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right text-black font-semibold">
                  תאריך
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  שם הכנס
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  מיקום הכנס
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  שם מלא של העובד
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  מייל עובד
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  מנהל המשמרת
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  תפקיד
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  שעת התחלה
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  שעת סיום
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  סה״כ שעות
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  שכר שעתי
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  בונוס
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  החזר נסיעות
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  סה״כ משכורת
                </TableHead>
                <TableHead className="text-right text-black font-semibold">
                  פעולות
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={15}
                    className="text-center text-gray-500 py-8"
                  >
                    לא נמצאו משמרות
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift) => {
                  const isEditing = editingId === shift.id;
                  const displayShift =
                    isEditing && editedShift ? editedShift : shift;
                  const workerName =
                    displayShift.worker_full_name ||
                    displayShift.worker?.full_name ||
                    "לא ידוע";
                  const workerEmail =
                    displayShift.worker_email ||
                    displayShift.worker?.email ||
                    "לא ידוע";

                  return (
                    <TableRow key={shift.id} className="hover:bg-gray-50">
                      <TableCell className="text-right text-black">
                        {new Date(displayShift.shift_date).toLocaleDateString(
                          "he-IL"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-black">
                        {displayShift.event_name}
                      </TableCell>
                      <TableCell className="text-right text-gray-700">
                        {displayShift.location}
                      </TableCell>
                      <TableCell className="text-right font-medium text-black">
                        {workerName}
                      </TableCell>
                      <TableCell className="text-right text-gray-700">
                        {workerEmail}
                      </TableCell>
                      <TableCell className="text-right text-gray-700">
                        {displayShift.manager}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          {roleLabels[displayShift.role]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="time"
                            value={displayShift.start_time}
                            onChange={(e) =>
                              handleFieldChange("start_time", e.target.value)
                            }
                            className="w-28 text-right border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        ) : (
                          <span className="text-black">
                            {displayShift.start_time}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="time"
                            value={displayShift.end_time}
                            onChange={(e) =>
                              handleFieldChange("end_time", e.target.value)
                            }
                            className="w-28 text-right border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        ) : (
                          <span className="text-black">
                            {displayShift.end_time}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-black font-medium">
                        {displayShift.total_hours.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayShift.hourly_rate}
                            onChange={(e) =>
                              handleFieldChange(
                                "hourly_rate",
                                Number(e.target.value)
                              )
                            }
                            className="w-24 text-right border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        ) : (
                          <span className="text-black">
                            ₪{displayShift.hourly_rate}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayShift.wage_bonus}
                            onChange={(e) =>
                              handleFieldChange(
                                "wage_bonus",
                                Number(e.target.value)
                              )
                            }
                            className="w-24 text-right border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        ) : (
                          <span className="text-black">
                            ₪{displayShift.wage_bonus}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayShift.travel_amount}
                            onChange={(e) =>
                              handleFieldChange(
                                "travel_amount",
                                Number(e.target.value)
                              )
                            }
                            className="w-24 text-right border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        ) : (
                          <span className="text-black">
                            ₪{displayShift.travel_amount}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-black font-bold">
                        ₪{displayShift.shift_pay_total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={handleSave}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                <Save className="h-4 w-4 ml-1" />
                                שמור
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                ביטול
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(shift)}
                                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                              >
                                <Edit2 className="h-4 w-4 ml-1" />
                                ערוך
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(shift.id)}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 ml-1" />
                                מחק
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את המשמרת לצמיתות ולא ניתן לשחזר אותה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              לא
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              כן, מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
