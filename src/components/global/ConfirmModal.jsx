
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-[#285C3A] hover:bg-[#173F2A] focus-visible:ring-[#285C3A]";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="global-confirm-title"
        aria-describedby="global-confirm-message"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E5DCC8] bg-[#FFFEFA] shadow-2xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E9D9] text-[#9A6429]">
            <AlertTriangle size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="global-confirm-title"
              className="text-xl font-bold text-[#173F2A]"
            >
              {title}
            </h2>

            <p
              id="global-confirm-message"
              className="mt-2 whitespace-pre-line text-sm leading-6 text-[#687064]"
            >
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation"
            className="rounded-full p-2 text-[#687064] hover:bg-[#F0EEE5] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E9E3D7] bg-[#FAF7EF] p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-[#D8D5C8] bg-white px-5 py-3 font-semibold text-[#344637] hover:bg-[#F4F2E9] disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-5 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
