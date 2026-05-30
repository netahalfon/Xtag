"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Send, MessageSquare } from "lucide-react";
import type { Inquiry } from "@/types/inquiry";
import { createInquiry } from "./actions";

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

export function WorkerInquiriesClient({
  inquiries: initial,
}: {
  inquiries: Inquiry[];
}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initial);

  // New inquiry dialog
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail dialog
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const resetForm = () => {
    setSubject("");
    setContent("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createInquiry({ subject, content });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setInquiries((prev) => [result.inquiry, ...prev]);
    resetForm();
    setNewOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-black">
            הפניות שלי
          </h1>
          <Button
            onClick={() => setNewOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 ml-2" />
            פנייה חדשה
          </Button>
        </div>

        {inquiries.length === 0 ? (
          <Card className="border-orange-200 p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-orange-300" />
            <p className="text-black/60">
              לא נשלחו פניות עדיין. לחצי על "פנייה חדשה" כדי להתחיל.
            </p>
          </Card>
        ) : (
          <div className="rounded-xl border border-orange-200 bg-white shadow-sm divide-y divide-orange-100 overflow-hidden">
            {inquiries.map((inq) => {
              const isClosed = inq.status === "closed";
              return (
                <button
                  key={inq.id}
                  type="button"
                  onClick={() => setSelected(inq)}
                  className="w-full text-right px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3"
                >
                  <p className="min-w-0 flex-1 font-medium text-black truncate">
                    {inq.subject}
                  </p>
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

      {/* Detail dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
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
                <p className="text-sm text-black whitespace-pre-wrap wrap-break-word">
                  {selected.content}
                </p>

                {selected.admin_response?.trim() ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        תשובת המעסיק
                      </span>
                      {selected.responded_at && (
                        <span className="text-xs text-gray-500">
                          {formatDate(selected.responded_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-word">
                      {selected.admin_response}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-black/50 italic">
                    טרם התקבלה תשובה
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New inquiry dialog */}
      <Dialog
        open={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              פנייה חדשה
            </DialogTitle>
            <DialogDescription>
              הפנייה תישלח למנהל המערכת ותענה בהקדם.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inquiry-subject">נושא</Label>
              <Input
                id="inquiry-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="במה מדובר?"
                required
                disabled={submitting}
                className="focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiry-content">תוכן</Label>
              <Textarea
                id="inquiry-content"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="כתבי כאן את פרטי הפנייה"
                required
                disabled={submitting}
                className="resize-none focus-visible:ring-orange-500"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Send className="h-4 w-4 ml-2" />
                {submitting ? "שולח..." : "שלח פנייה"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
