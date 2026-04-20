"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Eye, FileText } from "@/components/common/icons";
import { getStudentCertificates } from "@/services/student/student.certificate.service";
import { notify } from "@/store/notification.store";
import { formatDate } from "@/utils/helpers";

function buildCertificateHtml(certificate) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${certificate.courseTitle} Certificate</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #f8fafc, #e0f2fe);
          color: #0f172a;
        }
        .wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .certificate {
          max-width: 900px;
          width: 100%;
          background: white;
          border: 8px solid #0f172a;
          border-radius: 28px;
          padding: 56px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18);
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.4em;
          font-size: 12px;
          color: #0284c7;
          font-weight: 700;
        }
        h1 {
          margin: 24px 0 10px;
          font-size: 44px;
        }
        p {
          font-size: 18px;
          line-height: 1.7;
          color: #334155;
        }
        .course {
          margin: 28px 0;
          font-size: 32px;
          font-weight: 700;
        }
        .footer {
          margin-top: 44px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #475569;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="certificate">
          <div class="eyebrow">Certificate of Completion</div>
          <h1>Learning Achievement Award</h1>
          <p>This certifies successful completion of the guided learning experience below.</p>
          <div class="course">${certificate.courseTitle}</div>
          <p>Instructor: ${certificate.instructorName}</p>
          <p>Completion date: ${formatDate(certificate.completionDate)}</p>
          <div class="footer">
            <span>Student Workspace Certificate</span>
            <span>ID: ${certificate.id}</span>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function CertificatesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-slate-200" />
      ))}
    </div>
  );
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await getStudentCertificates();
        setCertificates(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load certificates.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  if (loading) {
    return <CertificatesSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Certificates unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;
  }

  if (!certificates.length) {
    return <EmptyState title="No certificates yet" description="Finish a course path to unlock your downloadable completion certificate." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {certificates.map((certificate) => (
        <article key={certificate.id} className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm">
          <div className="bg-[linear-gradient(135deg,_#0f172a,_#0f766e)] px-6 py-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-100">Course Completion Certificate</p>
            <h2 className="mt-4 text-2xl font-semibold">{certificate.courseTitle}</h2>
            <p className="mt-2 text-sm text-white/80">Instructor: {certificate.instructorName}</p>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completion Date</p>
                <p className="mt-3 font-semibold text-slate-900">{formatDate(certificate.completionDate)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="mt-3 font-semibold text-slate-900">{certificate.progressPercentage}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const certificateWindow = window.open("", "_blank", "noopener,noreferrer");

                  if (certificateWindow) {
                    certificateWindow.document.write(buildCertificateHtml(certificate));
                    certificateWindow.document.close();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Eye className="h-4 w-4" />
                View Certificate
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([buildCertificateHtml(certificate)], { type: "text/html" });
                  const url = window.URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `${certificate.courseTitle.replace(/\s+/g, "-").toLowerCase()}-certificate.html`;
                  anchor.click();
                  window.URL.revokeObjectURL(url);
                  notify({
                    type: "success",
                    title: "Certificate downloaded",
                    message: "Your completion certificate has been generated successfully.",
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Download Certificate
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
