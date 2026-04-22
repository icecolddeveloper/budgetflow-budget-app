import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function pushToast({ title, message, tone = "success" }) {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const value = {
    success(title, message) {
      pushToast({ title, message, tone: "success" });
    },
    error(title, message) {
      pushToast({ title, message, tone: "error" });
    },
    info(title, message) {
      pushToast({ title, message, tone: "info" });
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <div className="toast__icon">
              {toast.tone === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div className="toast__content">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
