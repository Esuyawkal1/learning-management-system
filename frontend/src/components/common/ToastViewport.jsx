"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "@/components/common/icons";
import useNotificationStore from "@/store/notification.store";

const toastStyles = {
  success: {
    container: "border-emerald-200 bg-emerald-50",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  },
  error: {
    container: "border-rose-200 bg-rose-50",
    icon: <TriangleAlert className="h-5 w-5 text-rose-600" />,
  },
  info: {
    container: "border-sky-200 bg-sky-50",
    icon: <Info className="h-5 w-5 text-sky-600" />,
  },
};

export default function ToastViewport() {
  const toasts = useNotificationStore((state) => state.toasts);
  const removeToast = useNotificationStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-sm ${style.container}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{style.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm text-slate-600">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-white/80 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
