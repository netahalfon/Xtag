"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { updateWorkerProfile, uploadForm101 } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkerProfile = {
  email: string;
  full_name: string;
  role: "worker" | "manager" | "admin" | string;

  phone: string;
  birth_date: string;
  city: string;

  id_number: string;

  bank_name: string;
  bank_branch_number: string;
  bank_account_number: string;

  car_number: string | null;

  emergency_contact_name: string;
  emergency_contact_phone: string;

  form101_pdf_path: string | null;
};

const bankNames = [
  'בנק יהב לעובדי המדינה בע"מ (מספר בנק - 4)',
  'בנק לאומי לישראל בע"מ (מספר בנק - 10)',
  'בנק דיסקונט לישראל בע"מ (מספר בנק - 11)',
  'בנק הפועלים בע"מ (מספר בנק - 12)',
  'בנק אגוד לישראל בע"מ (מספר בנק - 13)',
  'בנק אוצר החייל בע"מ (מספר בנק - 14)',
  'בנק מרכנתיל דיסקונט בע"מ (מספר בנק - 17)',
  'בנק מזרחי טפחות בע"מ (מספר בנק - 20)',
  "בנק הדואר (מספר בנק - 9)",
  "Citibank N.A (מספר בנק - 22)",
  "HSBC Bank plc (מספר בנק - 23)",
  'יובנק בע"מ (מספר בנק - 26)',
  "Barclays Bank PLC (מספר בנק - 27)",
  'הבנק הבינלאומי הראשון לישראל בע"מ (מספר בנק - 31)',
  'בנק מסד בע"מ (מספר בנק - 46)',
  'בנק ירושלים בע"מ (מספר בנק - 54)',
  "בנק ישראל (מספר בנק - 99)",
];

// Keep UI clean, but send digits-only to the server (like your payload)
const digitsOnly = (value: string) => value.replace(/\D/g, "");

export default function WorkerSettingsClient({
  initialUserData,
}: {
  initialUserData: WorkerProfile;
}) {
  // Ensure any missing fields won't crash the UI
  const normalizedInitial: WorkerProfile = {
    email: initialUserData.email ?? "",
    full_name: initialUserData.full_name ?? "",
    role: initialUserData.role ?? "worker",

    phone: initialUserData.phone ?? "",
    birth_date: initialUserData.birth_date ?? "",
    city: initialUserData.city ?? "",

    id_number: initialUserData.id_number ?? "",

    bank_name: initialUserData.bank_name ?? "",
    bank_branch_number: initialUserData.bank_branch_number ?? "",
    bank_account_number: initialUserData.bank_account_number ?? "",

    car_number: initialUserData.car_number ?? null,

    emergency_contact_name: initialUserData.emergency_contact_name ?? "",
    emergency_contact_phone: initialUserData.emergency_contact_phone ?? "",

    form101_pdf_path: initialUserData.form101_pdf_path ?? null,
  };

  const [userData, setUserData] = useState<WorkerProfile>(normalizedInitial);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] =
    useState<WorkerProfile>(normalizedInitial);
  const [isPending, startTransition] = useTransition();

  const [uploadingFile, setUploadingFile] = useState(false);

  const handleInputChange = (field: keyof WorkerProfile, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("אנא העלה קובץ PDF");
      return;
    }

    setUploadingFile(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await uploadForm101(fd);

      setUserData((prev) => ({ ...prev, form101_pdf_path: res.filePath }));
      setEditedData((prev) => ({ ...prev, form101_pdf_path: res.filePath }));
    } catch (err: any) {
      alert(err?.message ?? "שגיאה בהעלאה");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = () => {
    console.log("[WorkerSettings] Save clicked. payload:", editedData);

    startTransition(async () => {
      try {
        await updateWorkerProfile({
          // match your required payload fields:

          phone: digitsOnly(editedData.phone),
          birth_date: editedData.birth_date,
          city: editedData.city?.trim(),

          bank_name: editedData.bank_name?.trim(),
          bank_branch_number: digitsOnly(editedData.bank_branch_number),
          bank_account_number: digitsOnly(editedData.bank_account_number),

          car_number: editedData.car_number?.trim()
            ? digitsOnly(editedData.car_number)
            : null,

          emergency_contact_name: editedData.emergency_contact_name?.trim(),
          emergency_contact_phone: digitsOnly(
            editedData.emergency_contact_phone
          ),

          form101_pdf_path: editedData.form101_pdf_path,
        });

        setUserData(editedData);
        setIsEditing(false);
      } catch (err: any) {
        alert(err?.message ?? "שגיאה בשמירה");
      }
    });
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const currentData = isEditing ? editedData : userData;

  return (
    <div className="min-h-screen bg-white py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">הגדרות פרופיל</h1>
          <p className="text-gray-600">ניהול המידע האישי והבנקאי שלך</p>
        </div>

        {/* Personal Information */}
        <Card className="mb-6 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-black">מידע אישי</CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Email - Read-only */}
            <div>
              <Label className="text-black font-medium">אימייל</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  value={currentData.email ?? ""}
                  readOnly
                  className="bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200"
                />
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 text-xs"
                >
                  קריאה בלבד
                </Badge>
              </div>
            </div>

            {/* Full Name - Read-only (kept as read-only like you had) */}
            <div>
              <Label className="text-black font-medium">שם מלא</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  value={currentData.full_name ?? ""}
                  readOnly
                  className="bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200"
                />
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 text-xs"
                >
                  קריאה בלבד
                </Badge>
              </div>
            </div>

            {/* ID Number - Editable (required in DB, but UI can still allow edit if you want) */}
            <div>
              <Label className="text-black font-medium">תעודת זהות</Label>
              <Input
                value={currentData.id_number ?? ""}
                onChange={(e) => handleInputChange("id_number", e.target.value)}
                disabled={!isEditing}
                inputMode="numeric"
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Phone - Editable */}
            <div>
              <Label className="text-black font-medium">טלפון</Label>
              <Input
                value={currentData.phone ?? ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                inputMode="tel"
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Birth Date - Editable */}
            <div>
              <Label className="text-black font-medium">תאריך לידה</Label>
              <Input
                type="date"
                value={currentData.birth_date ?? ""}
                onChange={(e) =>
                  handleInputChange("birth_date", e.target.value)
                }
                disabled={!isEditing}
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* City - Editable */}
            <div>
              <Label className="text-black font-medium">כתובת מגורים</Label>
              <Input
                value={currentData.city ?? ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={!isEditing}
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
              
            </div>

            {/* Car Number - Editable (optional) */}
            <div>
              <Label className="text-black font-medium">
                מספר רכב (לא חובה)
              </Label>
              <Input
                value={currentData.car_number ?? ""}
                onChange={(e) =>
                  handleInputChange("car_number", e.target.value)
                }
                disabled={!isEditing}
                inputMode="numeric"
                placeholder="לדוגמה: 1234567"
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Emergency Contact */}
            <div className="pt-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-black font-medium"> שם איש קשר לחירום</Label>
                  <Input
                  
                    value={currentData.emergency_contact_name ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact_name",
                        e.target.value
                      )
                    }
                    disabled={!isEditing}
                    className={
                      isEditing
                        ? "border-orange-500 focus-visible:ring-orange-500"
                        : "border-gray-200"
                    }
                  />
                </div>

                <div>
                  <Label className="text-black font-medium">
                    טלפון איש קשר לחירום
                  </Label>
                  <Input
                    value={currentData.emergency_contact_phone ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact_phone",
                        e.target.value
                      )
                    }
                    disabled={!isEditing}
                    inputMode="tel"
                    className={
                      isEditing
                        ? "border-orange-500 focus-visible:ring-orange-500"
                        : "border-gray-200"
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card className="mb-6 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-black">מידע בנקאי</CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Bank Name - Editable */}
            <div>
              <Label className="text-black font-medium">שם הבנק</Label>

              <select
                value={currentData.bank_name || ""}
                onChange={(e) => handleInputChange("bank_name", e.target.value)}
                disabled={!isEditing}
                className={`w-full h-10 px-3 rounded-md border text-sm
                  ${
                    isEditing
                      ? "border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      : "border-gray-200 bg-gray-100"
                  }`}
              >
                <option value="" disabled>
                  בחר בנק
                </option>

                {bankNames.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Branch Number - Editable */}
            <div>
              <Label className="text-black font-medium">מספר סניף</Label>
              <Input
                value={currentData.bank_branch_number ?? ""}
                onChange={(e) =>
                  handleInputChange("bank_branch_number", e.target.value)
                }
                disabled={!isEditing}
                inputMode="numeric"
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Bank Account Number - Editable */}
            <div>
              <Label className="text-black font-medium">מספר חשבון</Label>
              <Input
                value={currentData.bank_account_number ?? ""}
                onChange={(e) =>
                  handleInputChange("bank_account_number", e.target.value)
                }
                disabled={!isEditing}
                inputMode="numeric"
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Form 101 Information */}
        <Card className="mb-6 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-black">טופס 101</CardTitle>
          </CardHeader>

          <CardContent className="pt-2 space-y-8">
            <div>
              <a
                href="https://tofes101.co.il/fill-form-101/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200 transition"
              >
                מילוי טופס 101
              </a>
            </div>

            <div>
              <div className="mt-1.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      currentData.form101_pdf_path
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {currentData.form101_pdf_path ? "הועלה" : "לא הועלה"}
                  </Badge>

                  {currentData.form101_pdf_path && (
                    <span className="text-sm text-gray-600">
                      {currentData.form101_pdf_path}
                    </span>
                  )}
                </div>

                {!currentData.form101_pdf_path && (
                  <div>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="cursor-pointer file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer"
                    />
                    {uploadingFile && (
                      <p className="text-sm text-orange-600 mt-1">מעלה...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ערוך פרופיל
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={isPending}
                variant="outline"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPending ? "שומר..." : "שמור שינויים"}
              </Button>

              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300 text-black hover:bg-gray-50 bg-transparent"
              >
                ביטול
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
