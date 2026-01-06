"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // NEW: missing fields
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [city, setCity] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankBranchNumber, setBankBranchNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const [carNumber, setCarNumber] = useState(""); // optional

  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  // Form 101 temp upload
  const [form101TempPath, setForm101TempPath] = useState<string | null>(null);
  const [uploading101, setUploading101] = useState(false);
  const [bankDetailsConfirmed, setBankDetailsConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // NEW: minimal helpers
  const digitsOnly = (v: string) => v.replace(/[^\d]/g, "");
  const isEmailValid = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const isPhoneValid = (v: string) => {
    const d = digitsOnly(v);
    return d.length === 10 && d.startsWith("0");
  };

  const isIdValid = (id: string) => {
    const str = digitsOnly(id).padStart(9, "0");
    if (!/^\d{9}$/.test(str)) return false;

    const sum = str
      .split("")
      .map((ch, i) => {
        let n = Number(ch) * ((i % 2) + 1);
        if (n > 9) n -= 9;
        return n;
      })
      .reduce((a, b) => a + b, 0);

    return sum % 10 === 0;
  };

  const handleForm101Upload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const safeIdNumber = digitsOnly(idNumber);
    if (
      !safeIdNumber ||
      safeIdNumber.length !== 9 ||
      !isIdValid(safeIdNumber)
    ) {
      setError("יש להזין תעודת זהות תקינה לפני העלאת טופס 101");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("אנא העלי טופס 101 בפורמט PDF בלבד");
      return;
    }

    // (תואם למה שהגדרת במסך יצירת bucket: 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("הקובץ גדול מדי (מקסימום 5MB)");
      return;
    }

    setError(null);
    setUploading101(true);

    try {
      const supabase = createClient();
      const safeIdNumber = idNumber.replace(/\D/g, "");
      if (!safeIdNumber) {
        throw new Error("Missing id_number for file upload");
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const timestamp = Date.now();

      // path תקני ל־Supabase Storage
      const filePath = `form101/${year}/${safeIdNumber}_${day}${month}${year}_${timestamp}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("forms101") // bucket name
        .upload(filePath, file, {
          upsert: false,
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      setForm101TempPath(filePath);
    } catch (err: any) {
      setForm101TempPath(null);
      setError(err?.message ?? "שגיאה בהעלאת טופס 101");
    } finally {
      setUploading101(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // existing validations
    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setIsLoading(false);
      return;
    }

    // NEW: minimal validations for new fields
    if (!fullName.trim()) {
      setError("חובה להזין שם מלא");
      setIsLoading(false);
      return;
    }

    if (!email.trim() || !isEmailValid(email)) {
      setError("אימייל לא תקין");
      setIsLoading(false);
      return;
    }

    if (!phone.trim() || !isPhoneValid(phone)) {
      setError("טלפון לא תקין (לדוגמה: 05XXXXXXXX)");
      setIsLoading(false);
      return;
    }

    if (!birthDate) {
      setError("חובה להזין תאריך לידה");
      setIsLoading(false);
      return;
    }

    if (!city.trim()) {
      setError("חובה להזין כתובת/עיר");
      setIsLoading(false);
      return;
    }

    const cleanedId = digitsOnly(idNumber);
    if (!cleanedId || cleanedId.length !== 9 || !isIdValid(cleanedId)) {
      setError("תעודת זהות לא תקינה");
      setIsLoading(false);
      return;
    }

    if (!bankName.trim()) {
      setError("חובה להזין שם בנק");
      setIsLoading(false);
      return;
    }

    if (
      !bankBranchNumber.trim() ||
      !/^\d{2,5}$/.test(digitsOnly(bankBranchNumber))
    ) {
      setError("מספר סניף לא תקין");
      setIsLoading(false);
      return;
    }

    if (
      !bankAccountNumber.trim() ||
      !/^\d{5,12}$/.test(digitsOnly(bankAccountNumber))
    ) {
      setError("מספר חשבון לא תקין");
      setIsLoading(false);
      return;
    }

    if (carNumber.trim() && !/^\d{7,8}$/.test(digitsOnly(carNumber))) {
      setError("מספר רכב לא תקין (7–8 ספרות)");
      setIsLoading(false);
      return;
    }

    if (!emergencyContactName.trim()) {
      setError("חובה להזין שם איש קשר לחירום");
      setIsLoading(false);
      return;
    }

    if (!emergencyContactPhone.trim() || !isPhoneValid(emergencyContactPhone)) {
      setError("טלפון לחירום לא תקין (לדוגמה: 05XXXXXXXX)");
      setIsLoading(false);
      return;
    }

    if (!form101TempPath) {
      setError("חובה להעלות טופס 101 (PDF) לפני הרשמה");
      setIsLoading(false);
      return;
    }
    if (!bankDetailsConfirmed) {
      setError("יש לאשר שפרטי הבנק שהוזנו נכונים ומעודכנים לפני הרשמה");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/login`,
          data: {
            full_name: fullName,
            role: "worker",
            phone: digitsOnly(phone),
            birth_date: birthDate,
            city: city.trim(),
            id_number: cleanedId,

            bank_name: bankName.trim(),
            bank_branch_number: digitsOnly(bankBranchNumber),
            bank_account_number: digitsOnly(bankAccountNumber),

            car_number: carNumber.trim() ? digitsOnly(carNumber) : null,

            emergency_contact_name: emergencyContactName.trim(),
            emergency_contact_phone: digitsOnly(emergencyContactPhone),
            form101_pdf_path: form101TempPath,
          },
        },
      });

      if (error) throw error;

      alert("בדקי את האימייל כדי לאשר את החשבון!");
      router.push("/auth/login");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="card shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">הרשמה</h2>

          <form onSubmit={handleSignup}>
            {/* existing fields - unchanged */}
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">
                שם מלא
              </label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                כתובת אימייל
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            {/* NEW fields (added, same style) */}
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                טלפון
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                placeholder="05XXXXXXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="birthDate" className="form-label">
                תאריך לידה
              </label>
              <input
                type="date"
                className="form-control"
                id="birthDate"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                כתובת
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="idNumber" className="form-label">
                תעודת זהות
              </label>
              <input
                type="text"
                className="form-control"
                id="idNumber"
                placeholder="9 ספרות"
                required
                value={idNumber}
                onChange={(e) =>
                  setIdNumber(digitsOnly(e.target.value).slice(0, 9))
                }
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
              <div className="form-text">9 ספרות בלבד</div>
            </div>

            {/* original password fields - unchanged */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                סיסמה
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
              <div className="form-text">חייבת להכיל לפחות 6 תווים</div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                אימות סיסמה
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            {/* NEW bank fields */}
            <div className="mb-3">
              <label htmlFor="bankName" className="form-label">
                שם בנק
              </label>
              <select
                id="bankName"
                className="form-control"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={isLoading}
              >
                <option value="">בחרי בנק</option>
                {bankNames.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="bankBranchNumber" className="form-label">
                מספר סניף
              </label>
              <input
                type="text"
                className="form-control"
                id="bankBranchNumber"
                required
                value={bankBranchNumber}
                onChange={(e) =>
                  setBankBranchNumber(digitsOnly(e.target.value).slice(0, 5))
                }
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="bankAccountNumber" className="form-label">
                מספר חשבון
              </label>
              <input
                type="text"
                className="form-control"
                id="bankAccountNumber"
                required
                value={bankAccountNumber}
                onChange={(e) =>
                  setBankAccountNumber(digitsOnly(e.target.value).slice(0, 12))
                }
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            {/* NEW optional car number */}
            <div className="mb-3">
              <label htmlFor="carNumber" className="form-label">
                מספר רכב <span className="text-muted">(לא חובה)</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="carNumber"
                value={carNumber}
                onChange={(e) =>
                  setCarNumber(digitsOnly(e.target.value).slice(0, 8))
                }
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            {/* NEW emergency fields */}
            <div className="mb-3">
              <label htmlFor="emergencyContactName" className="form-label">
                שם איש קשר לחירום
              </label>
              <input
                type="text"
                className="form-control"
                id="emergencyContactName"
                required
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="emergencyContactPhone" className="form-label">
                טלפון לחירום
              </label>
              <input
                type="tel"
                className="form-control"
                id="emergencyContactPhone"
                placeholder="05XXXXXXXX"
                required
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                disabled={isLoading}
                style={{ direction: "ltr" }}
              />
            </div>

            {/* Form 101 upload (TEMP) */}
            <div className="mb-3">
              <label htmlFor="form101" className="form-label">
                טופס 101 (PDF) <span className="text-danger">*</span>
              </label>

              <input
                type="file"
                className="form-control"
                id="form101"
                accept="application/pdf"
                onChange={handleForm101Upload}
                disabled={isLoading || uploading101}
              />

              <div className="form-text">
                {uploading101
                  ? "מעלה..."
                  : form101TempPath
                  ? "הקובץ הועלה ✅"
                  : "חובה להעלות טופס 101 לפני הרשמה"}
              </div>

              {/* אופציונלי: להציג נתיב (אני אישית לא הייתי מציג בפרוד) */}
              {form101TempPath && (
                <div className="form-text" style={{ direction: "ltr" }}>
                  {form101TempPath}
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label
                htmlFor="bankDetailsConfirmed"
                className="flex items-start gap-2 cursor-pointer text-sm text-gray-500"
                dir="rtl"
              >
                <input
                  type="checkbox"
                  id="bankDetailsConfirmed"
                  checked={bankDetailsConfirmed}
                  onChange={(e) => setBankDetailsConfirmed(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <span>
                  אני מאשר/ת כי פרטי הבנק/התשלום שהזנתי נכונים ומעודכנים,
                  והאחריות לכל טעות בהזנה חלה עליי בלבד.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm ms-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  יוצרת חשבון...
                </>
              ) : (
                "הרשמה"
              )}
            </button>

            <hr />

            <div className="text-center">
              <span className="text-muted small">כבר יש לך חשבון? </span>
              <Link href="/auth/login" className="text-decoration-none small">
                התחברות
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
