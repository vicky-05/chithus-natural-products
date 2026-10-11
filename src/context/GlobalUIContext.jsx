
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import ConfirmModal from "../components/global/ConfirmModal";
import ToastContainer from "../components/global/ToastContainer";

const GlobalUIContext = createContext(null);

export function GlobalUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const confirmationRef = useRef(null);
  const nextId = useRef(0);
  const busyRef = useRef(false);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, options = {}) => {
    const id = ++nextId.current;

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        title: options.title,
        type: options.type || "info",
        duration: options.duration ?? 4000,
      },
    ]);

    return id;
  }, []);

  const confirm = useCallback((options = {}) => {
    if (confirmationRef.current) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const request = {
        title: options.title || "Are you sure?",
        message: options.message || "This action cannot be undone.",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        onConfirm: options.onConfirm,
        resolve,
        loading: false,
      };

      confirmationRef.current = request;
      setConfirmation(request);
    });
  }, []);

  const finishConfirmation = useCallback((result) => {
    const request = confirmationRef.current;
    if (!request) return;

    confirmationRef.current = null;
    busyRef.current = false;
    setConfirmation(null);
    request.resolve(result);
  }, []);

  const cancelConfirmation = useCallback(() => {
    if (busyRef.current) return;
    finishConfirmation(false);
  }, [finishConfirmation]);

  const runConfirmation = useCallback(async () => {
    const request = confirmationRef.current;

    if (!request || busyRef.current) return;

    busyRef.current = true;
    setConfirmation({ ...request, loading: true });

    try {
      if (request.onConfirm) {
        await request.onConfirm();
      }

      finishConfirmation(true);
    } catch (error) {
      notify(
        error?.message || "The action could not be completed.",
        { type: "error", title: "Something went wrong", duration: 6000 }
      );

      finishConfirmation(false);
    }
  }, [finishConfirmation, notify]);

  return (
    <GlobalUIContext.Provider value={{ notify, confirm }}>
      {children}

      <ConfirmModal
        open={Boolean(confirmation)}
        title={confirmation?.title}
        message={confirmation?.message}
        confirmText={confirmation?.confirmText}
        cancelText={confirmation?.cancelText}
        variant={confirmation?.variant}
        loading={Boolean(confirmation?.loading)}
        onConfirm={runConfirmation}
        onCancel={cancelConfirmation}
      />

      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />
    </GlobalUIContext.Provider>
  );
}

export function useGlobalUI() {
  const context = useContext(GlobalUIContext);

  if (!context) {
    throw new Error("useGlobalUI must be used inside GlobalUIProvider");
  }

  return context;
}
