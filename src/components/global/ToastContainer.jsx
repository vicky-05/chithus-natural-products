
import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const styles = {
  success: {
    icon: CheckCircle2,
    color: "text-[#285C3A]",
    background: "bg-[#E7F0E8]",
  },
  error: {
    icon: XCircle,
    color: "text-red-700",
    background: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-700",
    background: "bg-amber-50",
  },
  info: {
    icon: Info,
    color: "text-blue-700",
    background: "bg-blue-50",
  },
};

function ToastItem({ toast, onRemove }) {
  const style = styles[toast.type] || styles.info;
  const Icon = style.icon;

  useEffect(() => {
    if (toast.duration === 0) return;

    const timer = setTimeout(
      () => onRemove(toast.id),
      toast.duration ?? 4000
    );

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#E5DCC8] bg-white p-4 shadow-xl"
    >
      <span className={`rounded-xl p-2 ${style.background} ${style.color}`}>
        <Icon size={21} />
      </span>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="font-semibold text-[#173F2A]">{toast.title}</p>
        )}
        <p className="mt-1 break-words text-sm leading-5 text-[#535D50]">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onRemove(toast.id)}
        className="rounded-full p-1 text-[#687064] hover:bg-[#F0EEE5]"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[11000] mx-auto flex w-full max-w-lg flex-col gap-3 px-4 sm:right-4 sm:left-auto">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
