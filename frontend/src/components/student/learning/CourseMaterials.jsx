"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/common/Modal";
import { ArrowRight, FileText } from "@/components/common/icons";

const getDocumentLabel = (document = {}) =>
  document.title || document.fileName || "Course material";

const getDocumentDescriptor = (document = {}) =>
  `${document.fileName || ""} ${document.fileUrl || ""}`.toLowerCase();

const getDocumentType = (document = {}) => {
  const descriptor = getDocumentDescriptor(document);

  if (descriptor.includes(".pdf")) {
    return "pdf";
  }

  if (descriptor.includes(".docx") || descriptor.includes(".doc")) {
    return "document";
  }

  if (descriptor.includes(".pptx") || descriptor.includes(".ppt")) {
    return "presentation";
  }

  if (descriptor.includes(".zip")) {
    return "archive";
  }

  return "file";
};

const buildPreviewUrl = (document = {}) => {
  if (!document.fileUrl) {
    return "";
  }

  if (getDocumentType(document) !== "pdf") {
    return document.fileUrl;
  }

  if (document.fileUrl.includes("#")) {
    return document.fileUrl;
  }

  return `${document.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
};

export default function CourseMaterials({
  documents = [],
  compact = false,
  showWhenEmpty = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const hasDocuments = documents.length > 0;
  const safeIndex = Math.min(activeDocumentIndex, Math.max(documents.length - 1, 0));
  const activeDocument = documents[safeIndex] || null;
  const activeDocumentType = getDocumentType(activeDocument || {});
  const canPreviewActiveDocument = useMemo(
    () => Boolean(activeDocument?.fileUrl) && activeDocumentType === "pdf",
    [activeDocument, activeDocumentType]
  );

  useEffect(() => {
    if (!documents.length) {
      setActiveDocumentIndex(0);
      setIsOpen(false);
      return;
    }

    if (activeDocumentIndex > documents.length - 1) {
      setActiveDocumentIndex(0);
    }
  }, [activeDocumentIndex, documents]);

  if (!compact && !hasDocuments) {
    return null;
  }

  if (compact && !hasDocuments && !showWhenEmpty) {
    return null;
  }

  const button = (
    <button
      type="button"
      disabled={!hasDocuments}
      onClick={() => hasDocuments && setIsOpen(true)}
      className={`group w-full rounded-[1.5rem] border px-4 py-3.5 text-left shadow-sm transition ${
        hasDocuments
          ? "border-sky-100 bg-sky-50/70 hover:border-sky-200 hover:bg-sky-100/70"
          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`rounded-xl p-2.5 shadow-sm ${
              hasDocuments ? "bg-white text-sky-700" : "bg-white text-slate-400"
            }`}
          >
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Course Materials
            </p>
          </div>
        </div>
        <ArrowRight
          className={`h-4 w-4 shrink-0 transition ${
            hasDocuments
              ? "text-sky-500 group-hover:translate-x-1"
              : "text-slate-300"
          }`}
        />
      </div>
    </button>
  );

  return (
    <>
      {button}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Course Materials"
        description="View shared course documents inside the learning workspace. Download actions are not shown here."
        maxWidth="max-w-6xl"
      >
        {hasDocuments ? (
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              {documents.map((document, index) => {
                const isActive = index === safeIndex;

                return (
                  <button
                    key={`${document.fileUrl || document.fileName || index}-${index}`}
                    type="button"
                    onClick={() => setActiveDocumentIndex(index)}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-sky-50/60"
                    }`}
                  >
                    <p className="truncate font-semibold">{getDocumentLabel(document)}</p>
                    <p
                      className={`mt-2 truncate text-sm ${
                        isActive ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {document.fileName}
                    </p>
                    <p
                      className={`mt-3 text-xs ${
                        isActive ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      Uploaded{" "}
                      {document.uploadedAt
                        ? new Date(document.uploadedAt).toLocaleDateString()
                        : "recently"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 bg-white px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  View Only
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {getDocumentLabel(activeDocument || {})}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Materials stay accessible inside this course workspace without direct download links.
                </p>
              </div>

              {canPreviewActiveDocument ? (
                <iframe
                  className="h-[70vh] w-full bg-white"
                  src={buildPreviewUrl(activeDocument)}
                  title={getDocumentLabel(activeDocument)}
                />
              ) : (
                <div className="flex h-[70vh] items-center justify-center px-8 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-sm">
                      <FileText className="h-7 w-7" />
                    </div>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                      {activeDocumentType}
                    </p>
                    <h4 className="mt-3 text-2xl font-semibold text-slate-900">
                      Preview not available
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      This material is attached to the course, but this file type does not have an
                      in-app preview in the learning workspace yet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
