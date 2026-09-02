import { useEffect, useRef } from "react";
import AuthForm from "./AuthForm";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, tab = "login", onSuccess, triggerToast }) {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Keyboard navigation & accessibility
  useEffect(() => {
    if (isOpen) {
      // Remember focus to restore later
      previouslyFocusedElement.current = document.activeElement;
      
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
        // Restore focus
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle overlay click (only if clicking the overlay itself)
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("auth-modal-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="auth-modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </button>

        {/* Modal Header Logo & Title */}
        <div className="auth-modal-header">
          <img src="/logo.png" alt="Brew Haven Logo" className="auth-modal-logo" />
          <h2 id="auth-modal-title" className="visually-hidden">Brew Haven Account</h2>
        </div>

        {/* Auth Form */}
        <AuthForm
          initialMode={tab}
          onSuccess={(user) => {
            onSuccess(user);
            onClose();
          }}
          triggerToast={triggerToast}
        />
      </div>
    </div>
  );
}
