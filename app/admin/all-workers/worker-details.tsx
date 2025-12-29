"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/user";

const roleLabels: Record<User["role"], string> = {
  worker: "עובד",
  manager: "מנהל",
  admin: "אדמין",
};
interface WorkerDetailsProps {
  user: User;
  onBack: () => void;
  onSaved: (updatedUser: User) => void;
  onDeleted: (userId: string) => void;
}

export function WorkerDetails({
  user,
  onBack,
  onSaved,
  onDeleted,
}: WorkerDetailsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<User>(user);

  const handleInputChange = (
    field: keyof User,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    // TODO: Replace with actual API call to delete user
    console.log("Deleting user:", user.id);

    onDeleted(user.id); // ✅ מוחק מהמערך באב

    toast({
      title: "העובד נמחק בהצלחה",
      description: "העובד הוסר מהמערכת",
      variant: "destructive",
    });

    onBack(); // ✅ חוזר לטבלה
  };

  const handleSave = async () => {
    // TODO: Replace with actual API call to update user
    console.log("Saving user:", formData);

    onSaved(formData); // ✅ updates table data
    onBack();
    toast({
      title: "העובד נשמר בהצלחה",
      description: "השינויים נשמרו במערכת",
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-black"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-black">פרטי עובד</h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                מחיקת עובד
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">
                  האם אתה בטוח?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  פעולה זו תמחק את העובד לצמיתות. לא ניתן לשחזר את הפעולה.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  כן, מחק
                </AlertDialogAction>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black border-b border-orange-500 pb-2">
              מידע אישי
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="full_name"
                  className="text-right block text-black"
                >
                  שם מלא
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block text-black">
                  אימייל
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block text-black">
                  טלפון
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="birth_date"
                  className="text-right block text-black"
                >
                  תאריך לידה
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "birth_date",
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-right block text-black">
                  עיר
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-right block text-black">
                  תפקיד
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="worker">{roleLabels.worker}</SelectItem>
                    <SelectItem value="manager">
                      {roleLabels.manager}
                    </SelectItem>
                    <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-right block text-black">
                הערות
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black border-b border-orange-500 pb-2">
              מידע שכר
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="salary_regular"
                  className="text-right block text-black"
                >
                  שכר רגיל (₪)
                </Label>
                <Input
                  id="salary_regular"
                  type="text"
                  value={formData.salary_regular}
                  onChange={(e) =>
                    handleInputChange("salary_regular", Number(e.target.value))
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="salary_manager"
                  className="text-right block text-black"
                >
                  שכר מנהל (₪)
                </Label>
                <Input
                  id="salary_manager"
                  type="text"
                  value={formData.salary_manager ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "salary_manager",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black border-b border-orange-500 pb-2">
              פרטי בנק
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="bank_name"
                  className="text-right block text-black"
                >
                  שם הבנק
                </Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) =>
                    handleInputChange("bank_name", e.target.value)
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bank_branch_number"
                  className="text-right block text-black"
                >
                  מספר סניף
                </Label>
                <Input
                  id="bank_branch_number"
                  value={formData.bank_branch_number}
                  onChange={(e) =>
                    handleInputChange("bank_branch_number", e.target.value)
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bank_account_number"
                  className="text-right block text-black"
                >
                  מספר חשבון
                </Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={(e) =>
                    handleInputChange("bank_account_number", e.target.value)
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="form101_pdf_path"
                  className="text-right block text-black"
                >
                  נתיב טופס 101
                </Label>
                <Input
                  id="form101_pdf_path"
                  value={formData.form101_pdf_path}
                  onChange={(e) =>
                    handleInputChange("form101_pdf_path", e.target.value)
                  }
                  className="text-right border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              שמירה
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
