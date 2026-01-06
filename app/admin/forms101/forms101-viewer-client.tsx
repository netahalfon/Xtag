"use client";

import { useState } from "react";
import type React from "react";
import { getForm101SignedUrlByFullPath } from "./actions";

type Worker = {
  id: string;
  email: string;
  full_name: string;
  form101_pdf_path: string | null;
};

export default function Forms101ViewerClient({ workers }: { workers: Worker[] }) {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const selectedWorker =
    workers.find((w) => w.id === selectedWorkerId) ?? null;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignedUrl(null);
    setFilePath(null);
    console.log("selectedWorker", selectedWorker);

    if (!selectedWorker) {
      setError("בחרי עובד.");
      return;
    }

    if (!selectedWorker.form101_pdf_path) {
      setError("אין טופס 101 לעובד שנבחר.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getForm101SignedUrlByFullPath(
        selectedWorker.form101_pdf_path
      );

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

                {selectedWorkerId && (
                  <div className="form-text">
                    {selectedWorker?.form101_pdf_path
                      ? "יש טופס 101 ✅"
                      : "אין טופס 101 ❌"}
                  </div>
                )}
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
