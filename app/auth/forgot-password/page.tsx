"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      setSuccess(true);
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
          <h2 className="card-title text-center mb-4">שכחת סיסמה</h2>

          {success ? (
            <div className="alert alert-success" role="alert">
              בדקי את האימייל שלך לקבלת קישור לאיפוס סיסמה!
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
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
                  style={{ direction: "ltr" }} // אימייל תמיד יותר נוח ב-LTR
                />
                <div className="form-text">נשלח לך קישור לאיפוס הסיסמה</div>
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
                    שולחת...
                  </>
                ) : (
                  "שלחי קישור לאיפוס"
                )}
              </button>
            </form>
          )}

          <hr />
          <div className="text-center">
            <Link href="/auth/login" className="text-decoration-none small">
              חזרה להתחברות
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
