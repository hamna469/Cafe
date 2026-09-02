import { useEffect, useState } from "react";

export function Toast({ message, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exiting after 2.2 seconds (so it completes by 2.5s)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    // Call onClose callback after 2.5 seconds to clean up state
    const closeTimer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className={`toast-notification ${isExiting ? "toast-exit" : "toast-enter"}`}>
      <span className="toast-icon">☕</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
