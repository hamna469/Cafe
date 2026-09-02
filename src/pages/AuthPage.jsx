import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import "../components/AuthModal.css";

export default function AuthPage({ defaultMode = "login", onSuccess, triggerToast }) {
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    onSuccess(user);
    // Redirect to home page
    navigate("/");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-page-card">
        {/* Header Logo */}
        <div className="auth-page-logo-container">
          <img src="/logo.png" alt="Brew Haven Logo" className="auth-page-logo" />
          <h2>Brew Haven</h2>
        </div>

        {/* Auth Form */}
        <AuthForm
          initialMode={defaultMode}
          onSuccess={handleSuccess}
          triggerToast={triggerToast}
          onSwitchMode={(newMode) => {
            // Update route URL dynamically to keep URL matched to form state
            if (newMode === "signup") {
              navigate("/signup");
            } else if (newMode === "login") {
              navigate("/login");
            }
          }}
        />
      </div>
    </div>
  );
}
