"use client";

import { useState } from "react";
import {
  FileText,
  Trash2,
  UploadCloud,
} from "@/components/common/icons";
import { uploadCourseDocument } from "@/services/upload.service";

const ACCEPTED_DOCUMENT_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.zip";

const getDefaultTitle = (fileName = "") =>
  fileName.replace(/\.[^/.]+$/, "").trim();

export default function CourseDocumentsUploader({
  documents = [],
  onChange,
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const updateDocuments = (nextDocuments) => {
    onChange?.(nextDocuments);
  };

  const handleFilesSelected = async (files) => {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      const uploadedDocuments = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const uploadedDocument = await uploadCourseDocument(file, (progress) => {
          const normalizedProgress = Math.round(
            ((index + progress / 100) / files.length) * 100
          );
          setUploadProgress(normalizedProgress);
        });

        uploadedDocuments.push({
          ...uploadedDocument,
          title: uploadedDocument?.title || getDefaultTitle(uploadedDocument?.fileName),
        });
      }

      updateDocuments([...documents, ...uploadedDocuments]);
      setUploadProgress(100);
    } catch (error) {
      setUploadError(error.message || "Failed to upload course documents.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">Course Documents</p>
        <p className="text-sm text-slate-500">
          Upload course-wide resources for enrolled students. Supported files: PDF, DOC,
          DOCX, PPT, PPTX, ZIP.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
        <UploadCloud className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Documents"}
        <input
          type="file"
          multiple
          accept={ACCEPTED_DOCUMENT_TYPES}
          className="hidden"
          onChange={async (event) => {
            await handleFilesSelected(Array.from(event.target.files || []));
            event.target.value = "";
          }}
        />
      </label>

      {isUploading || uploadProgress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isUploading ? "Uploading course documents..." : "Upload complete"}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}

      {documents.length ? (
        <div className="space-y-3">
          {documents.map((document, index) => (
            <div
              key={`${document.fileUrl}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {document.fileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded{" "}
                      {document.uploadedAt
                        ? new Date(document.uploadedAt).toLocaleDateString()
                        : "just now"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateDocuments(documents.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-slate-700">Document Title</span>
                <input
                  value={document.title || ""}
                  onChange={(event) => {
                    updateDocuments(
                      documents.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              title: event.target.value,
                            }
                          : item
                      )
                    );
                  }}
                  placeholder="Optional document title"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                />
              </label>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
