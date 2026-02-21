"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      // Ensure the recovery link is exchanged into a valid session before updating password
      const { data: sessionRes } = await supabase.auth.getSession();

      if (sessionRes.session) {
        setIsReady(true);
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(window.location.href);

      if (exchangeError) {
        setError("הלינק לאיפוס סיסמה פג תוקף או לא תקין. תבקש לינק חדש.");
        setIsReady(false);
        return;
      }

      const { data: sessionAfter } = await supabase.auth.getSession();
      setIsReady(!!sessionAfter.session);

      if (!sessionAfter.session) {
        setError("Auth session missing. נסה לבקש לינק חדש.");
      }
    })();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isReady) {
      setError("אין סשן פעיל לאיפוס. תבקש לינק חדש במייל.");
      setIsLoading(false);
      return;
    }

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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      alert("הסיסמה עודכנה בהצלחה!");
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
          <h2 className="card-title text-center mb-4">איפוס סיסמה</h2>

          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                סיסמה חדשה
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !isReady}
                style={{ direction: "ltr" }}
              />
              <div className="form-text">חייבת להכיל לפחות 6 תווים</div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                אימות סיסמה חדשה
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !isReady}
                style={{ direction: "ltr" }}
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
              disabled={isLoading || !isReady}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm ms-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  מעדכנת...
                </>
              ) : (
                "עדכון סיסמה"
              )}
            </button>
          </form>

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
