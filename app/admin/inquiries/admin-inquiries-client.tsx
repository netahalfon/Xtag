"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Save, Mail, Phone, Hash, MessageSquare } from "lucide-react";
import type { Inquiry } from "@/types/inquiry";
import { updateInquiry } from "./actions";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminInquiriesClient({
  inquiries: initial,
}: {
  inquiries: Inquiry[];
}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusDraft, setStatusDraft] = useState<Inquiry["status"]>("open");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((inq) => {
      const workerName = inq.worker?.full_name?.toLowerCase() ?? "";
      const subject = inq.subject.toLowerCase();
      const matchesSearch =
        !q || workerName.includes(q) || subject.includes(q);
      const matchesStatus =
        statusFilter === "all" || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, search, statusFilter]);

  const openDialog = (inq: Inquiry) => {
    setSelected(inq);
    setResponseText(inq.admin_response ?? "");
    setStatusDraft(inq.status);
    setError(null);
  };

  const closeDialog = () => {
    setSelected(null);
    setResponseText("");
    setStatusDraft("open");
    setError(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    const result = await updateInquiry({
      id: selected.id,
      response: responseText,
      status: statusDraft,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInquiries((prev) =>
      prev.map((i) => (i.id === result.inquiry.id ? result.inquiry : i)),
    );
    closeDialog();
  };

  const isDirty =
    !!selected &&
    ((selected.admin_response ?? "") !== responseText ||
      selected.status !== statusDraft);

  return (
    <div dir="rtl" className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl md:text-3xl font-bold text-black">
          ניהול פניות
        </h1>

        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              type="text"
              placeholder="   חיפוש לפי שם עובד או נושא..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 focus-visible:ring-orange-500"
            />
          </div>
          <Select
            dir="rtl"
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-44 focus:border-orange-500 focus:ring-orange-500">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="open">פתוח</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-orange-200 p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-orange-300" />
            <p className="text-black/60">לא נמצאו פניות</p>
          </Card>
        ) : (
          <div className="rounded-xl border border-orange-200 bg-white shadow-sm divide-y divide-orange-100 overflow-hidden">
            {filtered.map((inq) => {
              const isClosed = inq.status === "closed";
              return (
                <button
                  key={inq.id}
                  type="button"
                  onClick={() => openDialog(inq)}
                  className="w-full text-right px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-black truncate">
                      {inq.subject}
                    </p>
                    <p className="text-xs text-black/55 truncate mt-0.5">
                      {inq.worker?.full_name ?? "לא ידוע"}
                      {inq.worker?.employee_number
                        ? ` · מס' עובד: ${inq.worker.employee_number}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-black/50 tabular-nums">
                    {formatDate(inq.created_at)}
                  </span>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isClosed
                        ? "bg-gray-100 text-gray-600"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isClosed ? "סגור" : "פתוח"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent dir="rtl" className="sm:max-w-lg gap-3">
          {selected && (
            <>
              <DialogHeader className="space-y-0">
                <div className="flex items-baseline justify-between gap-3 pr-8">
                  <DialogTitle className="text-base font-semibold truncate">
                    {selected.subject}
                  </DialogTitle>
                  <span className="shrink-0 text-xs text-black/50 tabular-nums">
                    {formatDateTime(selected.created_at)}
                  </span>
                </div>
                <DialogDescription className="sr-only">
                  פרטי פנייה
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* Worker details */}
                <div className="rounded-md border border-orange-100 bg-orange-50/40 p-3 space-y-1 text-sm">
                  <p className="font-semibold text-black">
                    {selected.worker?.full_name ?? "לא ידוע"}
                  </p>
                  <div className="flex items-center gap-1.5 text-black/70">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {selected.worker?.email ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-black/70">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {selected.worker?.phone?.trim()
                        ? selected.worker.phone
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-black/70">
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    <span>{selected.worker?.employee_number ?? "—"}</span>
                  </div>
                </div>

                {/* Inquiry content */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-black">
                    תוכן הפנייה:
                  </p>
                  <p className="text-sm text-black whitespace-pre-wrap wrap-break-word">
                    {selected.content}
                  </p>
                </div>

                {/* Response + status */}
                <div className="space-y-2">
                  <Label
                    htmlFor="response"
                    className="text-sm font-semibold text-black"
                  >
                    תשובה:
                  </Label>
                  <Textarea
                    id="response"
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="כתוב כאן את התשובה"
                    disabled={submitting}
                    className="resize-none focus-visible:ring-orange-500"
                  />
                  {selected.responded_at && (
                    <p className="mt-3 text-xs text-black/50">
                      נענה ב-{formatDateTime(selected.responded_at)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select
                    dir="rtl"
                    value={statusDraft}
                    onValueChange={(v) =>
                      setStatusDraft(v as Inquiry["status"])
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger
                      id="status"
                      className="w-32 focus:border-orange-500 focus:ring-orange-500"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="open">פתוח</SelectItem>
                      <SelectItem value="closed">סגור</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={submitting}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={submitting || !isDirty}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {submitting ? "שומר..." : "שמור שינויים"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
