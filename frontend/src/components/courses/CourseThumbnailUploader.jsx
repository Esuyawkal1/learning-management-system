"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, UploadCloud } from "@/components/common/icons";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

export default function CourseThumbnailUploader({
  value,
  courseTitle,
  onUpload,
  onUrlChange,
  showUrlField = true,
}) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadedUrlLocked, setIsUploadedUrlLocked] = useState(false);

  useEffect(() => {
    if (!value) {
      setIsUploadedUrlLocked(false);
    }
  }, [value]);

  const validateFile = (file) => {
    if (file.type !== "image/png") {
      throw new Error("Only PNG thumbnails are allowed");
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      throw new Error("Thumbnail size must be less than 5MB");
    }
  };

  return (
    <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-sky-600">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Course Thumbnail</p>
          <p className="text-sm text-slate-500">Upload a PNG image under 5MB. The public thumbnail URL will be stored automatically.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
          <div className="relative aspect-[16/10]">
            <CourseThumbnailPreview src={value} alt={courseTitle || "Course thumbnail preview"} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <UploadCloud className="h-4 w-4" />
            Upload PNG Thumbnail
            <input
              type="file"
              accept="image/png,.png"
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
                  validateFile(file);
                  await onUpload(file, setProgress);
                  setProgress(100);
                  setIsUploadedUrlLocked(true);
                } catch (error) {
                  setProgress(0);
                  setUploadError(error.message || "Failed to upload thumbnail.");
                  setIsUploadedUrlLocked(false);
                } finally {
                  setIsUploading(false);
                  event.target.value = "";
                }
              }}
            />
          </label>

          {selectedFileName ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{selectedFileName}</span>
                <span>{isUploading ? `${progress}%` : progress ? "Uploaded" : "Waiting"}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}

          {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}

          {showUrlField ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Thumbnail URL</span>
              <input
                value={value}
                readOnly={isUploadedUrlLocked}
                onChange={(event) => {
                  setIsUploadedUrlLocked(false);
                  onUrlChange(event.target.value);
                }}
                placeholder="http://localhost:5000/uploads/courses/thumbnails/course-123.png"
                className={`w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm ${isUploadedUrlLocked ? "bg-slate-50 text-slate-500" : "text-slate-700"}`}
              />
            </label>
          ) : (
            <input type="hidden" value={value} readOnly />
          )}
        </div>
      </div>
    </div>
  );
}
