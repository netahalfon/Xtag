"use client";

import type React from "react";
import { useState } from "react";
import { useTransition } from "react";
import { updateWorkerProfile, uploadForm101 } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkerProfile = {
  email: string;
  full_name: string;
  phone: string;
  birth_date: string;
  city: string;
  form101_pdf_path: string | null;
  bank_name: string;
  bank_branch_number: string;
  bank_account_number: string;
  role?: string; // מגיע מה-select, לא חייבים להשתמש ב-UI
};

export default function WorkerSettingsClient({
  initialUserData,
}: {
  initialUserData: WorkerProfile;
}) {
  const [userData, setUserData] = useState<WorkerProfile>(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<WorkerProfile>(initialUserData);
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
    setUserData(editedData);
    setIsEditing(false);
    console.log("Saving data:", editedData);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const currentData = isEditing ? editedData : userData;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
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
                  value={currentData.email}
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

            {/* Full Name - Read-only */}
            <div>
              <Label className="text-black font-medium">שם מלא</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  value={currentData.full_name}
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

            {/* Phone - Editable */}
            <div>
              <Label className="text-black font-medium">טלפון</Label>
              <Input
                value={currentData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
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
                value={currentData.birth_date}
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
              <Label className="text-black font-medium">עיר</Label>
              <Input
                value={currentData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={!isEditing}
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Form 101 Upload Status - Read-only */}
            <div>
              <Label className="text-black font-medium">טופס 101</Label>
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

        {/* Banking Information */}
        <Card className="mb-6 border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-black">מידע בנקאי</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Bank Name - Editable */}
            <div>
              <Label className="text-black font-medium">שם הבנק</Label>
              <Input
                value={currentData.bank_name}
                onChange={(e) => handleInputChange("bank_name", e.target.value)}
                disabled={!isEditing}
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
            </div>

            {/* Bank Branch Number - Editable */}
            <div>
              <Label className="text-black font-medium">מספר סניף</Label>
              <Input
                value={currentData.bank_branch_number}
                onChange={(e) =>
                  handleInputChange("bank_branch_number", e.target.value)
                }
                disabled={!isEditing}
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
                value={currentData.bank_account_number}
                onChange={(e) =>
                  handleInputChange("bank_account_number", e.target.value)
                }
                disabled={!isEditing}
                className={
                  isEditing
                    ? "border-orange-500 focus-visible:ring-orange-500"
                    : "border-gray-200"
                }
              />
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
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                שמור שינויים
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
