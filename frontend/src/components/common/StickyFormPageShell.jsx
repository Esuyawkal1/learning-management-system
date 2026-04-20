"use client";

import { X } from "@/components/common/icons";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function StickyFormPageShell({
  title,
  description,
  breadcrumbs = [],
  onClose,
  footer,
  children,
}) {
  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-8.5rem)] flex-col overflow-hidden bg-slate-50 sm:-mx-6 lg:-mx-8">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0 space-y-3">
            <Breadcrumbs items={breadcrumbs} />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Close lesson workspace"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>

      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-md sm:px-6 lg:px-8">
        {footer}
      </div>
    </div>
  );
}
