"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { getForm101SignedUrlByPath } from "./actions";

type Worker = {
  id: string;
  email: string;
  full_name: string;
};

export default function Forms101ViewerClient({ workers }: { workers: Worker[] }) {
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignedUrl(null);
    setFilePath(null);

    if (!selectedWorkerId) {
      setError("בחרי עובד.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getForm101SignedUrlByPath(selectedWorkerId, selectedYear);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setSignedUrl(res.url);
      setFilePath(res.filePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="mb-4 text-center">צפייה בטופס 101</h2>

          <form onSubmit={handleFetch}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">עובד</label>
                <select
                  className="form-select"
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">בחרי עובד...</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">שנה</label>
                <select
                  className="form-select"
                  value={String(selectedYear)}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  disabled={isLoading}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="col-12">
                  <div className="alert alert-danger mb-0">{error}</div>
                </div>
              )}

              <div className="col-12">
                <button className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? "טוען..." : "הציגי טופס"}
                </button>
              </div>
            </div>
          </form>

          {signedUrl && (
            <>
              <hr />
              <div className="d-flex flex-column gap-2">
                {filePath && (
                  <div className="small text-muted" style={{ direction: "ltr" }}>
                    {filePath}
                  </div>
                )}

                <a
                  className="btn btn-outline-secondary"
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  פתיחה בטאב חדש
                </a>

                <div className="ratio ratio-4x3">
                  <iframe src={signedUrl} title="Form 101" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
