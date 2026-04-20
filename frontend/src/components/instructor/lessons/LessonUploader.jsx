"use client";

import { useState } from "react";
import { FileText, PlayCircle, UploadCloud } from "@/components/common/icons";

export default function LessonUploader({
  label,
  accept,
  kind,
  value,
  onUrlChange,
  onUpload,
  showUrlField = true,
}) {
  const [progress, setProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadedUrlLocked, setIsUploadedUrlLocked] = useState(false);

  const Icon = kind === "video" ? PlayCircle : FileText;

  return (
    <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-amber-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">Attach a file for upload feedback and store the hosted asset URL below.</p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        <UploadCloud className="h-4 w-4" />
        Choose file
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            setSelectedFileName(file.name);
            setProgress(0);
            setUploadError("");
            setIsUploading(true);

            try {
              if (onUpload) {
                await onUpload(file, setProgress);
                setProgress(100);
                setIsUploadedUrlLocked(true);
              }
            } catch (error) {
              setProgress(0);
              setUploadError(error.message || `Failed to upload ${kind}.`);
              setIsUploadedUrlLocked(false);
            } finally {
              setIsUploading(false);
              event.target.value = "";
            }
          }}
        />
      </label>

      {selectedFileName ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{selectedFileName}</span>
            <span>{isUploading ? `${progress}%` : progress ? "Uploaded" : "Waiting"}</span>
          </div>
          <div className="h-2 rounded-full bg-white">
            <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {uploadError ? (
        <p className="mt-4 text-sm text-rose-600">{uploadError}</p>
      ) : null}

      {showUrlField ? (
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700">{label} URL</span>
          <input
            value={value}
            readOnly={isUploadedUrlLocked}
            onChange={(event) => {
              setIsUploadedUrlLocked(false);
              onUrlChange(event.target.value);
            }}
            placeholder={kind === "video" ? "https://cdn.example.com/lesson.mp4" : "https://cdn.example.com/lesson.pdf"}
            className={`w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm ${isUploadedUrlLocked ? "bg-slate-50 text-slate-500" : ""}`}
          />
          {isUploadedUrlLocked ? (
            <p className="text-xs text-slate-500">This URL was generated from the uploaded file. Upload another file to replace it.</p>
          ) : null}
        </label>
      ) : (
        <input type="hidden" value={value} readOnly />
      )}
    </div>
  );
}
