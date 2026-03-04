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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Search, Trash2 } from "lucide-react";
import type { Shift } from "@/types/shift";
import { updateShift, deleteShift } from "./actions";
import { ShiftDetailPanel } from "./shift-detail-panel";

import dynamic from "next/dynamic";

const TruncatedTooltip = dynamic(
  () =>
    import("@/components/truncated-tooltip").then((m) => m.TruncatedTooltip),
  { ssr: false },
);

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

interface AllShiftsProps {
  shifts: Shift[];
}

const formatILDate = (value: string | Date) => {
  const d = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit", // 👈 שינוי כאן
  }).format(d);
};

export function AllShifts({ shifts: initialShifts }: AllShiftsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const filteredShifts = shifts.filter((shift) => {
    const workerName = shift.worker?.full_name || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      workerName.toLowerCase().includes(query) ||
      shift.event_name.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" || shift.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log("🔍 Filtered Shifts:", filteredShifts);
  const handleRowClick = (shift: Shift) => {
    setSelectedShift(shift);
    setDetailPanelOpen(true);
  };

  const handleShiftSave = async (updatedShift: Shift) => {
    await updateShift(updatedShift);
    setShifts((prevShifts) =>
      prevShifts.map((s) => (s.id === updatedShift.id ? updatedShift : s)),
    );
    setSelectedShift(updatedShift);
  };

  const handleDeleteClick = (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return;
    await deleteShift(shiftToDelete);
    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.id !== shiftToDelete),
    );
    if (selectedShift?.id === shiftToDelete) {
      setDetailPanelOpen(false);
      setSelectedShift(null);
    }
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-450">
        <h1 className="mb-8 text-3xl font-bold text-foreground">כל המשמרות</h1>

        {/* Search Input + Status Filter */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="   חיפוש לפי שם עובד או שם כנס..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-input focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <Select
            dir="rtl"
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-44 border-input focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="סינון לפי סטטוס" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="approved">מאושר</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shifts Table */}
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-right text-foreground font-semibold w-[140px]">
                  תאריך
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-[200px]">
                  שם הכנס
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-32.5">
                  שם העובד
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-21.25">
                  מספר עובד
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-17.5">
                  תפקיד
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-20">
                  התחלה
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-20">
                  סיום
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-18.75">
                  {'סה"כ שעות'}
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-18.75">
                  שכר שעתי
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-16.25">
                  בונוס
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-20">
                  נסיעות
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-22.5">
                  {'סה"כ '}
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-18.75">
                  סטטוס
                </TableHead>
                <TableHead className="text-right text-foreground font-semibold w-12.5">
                  <span className="sr-only">פעולות</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={14}
                    className="text-center text-muted-foreground py-8"
                  >
                    לא נמצאו משמרות
                  </TableCell>
                </TableRow>
              ) : (
                filteredShifts.map((shift) => {
                  const workerName = shift.worker?.full_name || "לא ידוע";
                  const employeeNumber = shift.worker?.employee_number || "---";

                  return (
                    <TableRow
                      key={shift.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(shift)}
                    >
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {formatILDate(shift.shift_date)}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <TruncatedTooltip text={shift.event_name} />
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <span className="block truncate max-w-full">
                          {workerName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {employeeNumber}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          {roleLabels[shift.role]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {shift.start_time.slice(0, 5)}
                      </TableCell>
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {shift.end_time.slice(0, 5)}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        {shift.total_hours.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {"₪"}
                        {shift.hourly_rate}
                      </TableCell>
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {"₪"}
                        {shift.wage_bonus}
                      </TableCell>
                      <TableCell className="text-right text-foreground whitespace-nowrap">
                        {"₪"}
                        {shift.travel_amount}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-bold whitespace-nowrap">
                        {"₪"}
                        {shift.shift_pay_total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[shift.status]}`}
                        >
                          {statusLabels[shift.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, shift.id)}
                          className="inline-flex items-center justify-center rounded-md border border-red-500 text-red-500 hover:bg-red-50 h-8 w-8"
                          aria-label="מחק"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Shift Detail / Edit Panel */}
      <ShiftDetailPanel
        shift={selectedShift}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        onSave={handleShiftSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>{"האם אתה בטוח?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {"פעולה זו תמחק את המשמרת לצמיתות ולא ניתן לשחזר אותה."}
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
              {"כן, מחק"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
