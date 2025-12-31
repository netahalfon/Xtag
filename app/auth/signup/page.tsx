"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
                style={{ direction: "ltr" }} // אימייל נוח יותר ב-LTR
              />
            </div>

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
                style={{ direction: "ltr" }} // סיסמה נוח יותר ב-LTR
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
                style={{ direction: "ltr" }} // סיסמה נוח יותר ב-LTR
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

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
