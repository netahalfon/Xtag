"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      console.log("[v0] Attempting login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("[v0] Login successful, user ID:", data.user.id);

      await supabase.rpc("create_user_profile_if_missing", {
        user_id: data.user.id,
        user_email: data.user.email || email,
      });

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .limit(1);

      console.log("[v0] User data fetched:", userData);

      if (userError) {
        console.error("[v0] Error fetching user data:", userError);
        throw userError;
      }

      const userRole =
        userData && userData.length > 0 ? userData[0].role : "worker";

      let redirectPath = "/";
      switch (userRole) {
        case "admin":
          redirectPath = "/admin/all-shifts";
          break;
        case "manager":
          redirectPath = "/manager/add-shifts";
          break;
        case "worker":
          redirectPath = "/worker/my-salary";
          break;
        default:
          redirectPath = "/";
      }

      console.log("[v0] Redirecting to:", redirectPath);
      router.push(redirectPath);
      router.refresh();
    } catch (error: unknown) {
      console.error("[v0] Login error:", error);
      setError(error instanceof Error ? error.message : "אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="card shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">התחברות</h2>

          <form onSubmit={handleLogin}>
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
                  מתחברת...
                </>
              ) : (
                "התחברי"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-decoration-none small"
              >
                שכחת סיסמה?
              </Link>
            </div>

            <hr />

            <div className="text-center">
              <span className="text-muted small">אין לך חשבון? </span>
              <Link href="/auth/signup" className="text-decoration-none small">
                הרשמה
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
