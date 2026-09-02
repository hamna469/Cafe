import { useState, useRef, useEffect } from "react";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000;

const RATE_LIMIT_STORAGE_KEY = "loginRateLimit";

const EMPTY_FORM = {
  name: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function AuthForm({
  initialMode = "login",
  onSuccess,
  onSwitchMode,
  triggerToast,
}) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [remainingLockTime, setRemainingLockTime] = useState(0);

  // ============================================================
  // AUTOFILL LEAKAGE TEST
  // ============================================================

  const [autofillDetected, setAutofillDetected] = useState(false);

  const autofillUsernameRef = useRef(null);
  const autofillPasswordRef = useRef(null);

  const firstInputRef = useRef(null);

  // ============================================================
  // AUTOFILL DETECTION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const checkForAutofill = () => {
      if (cancelled) return;

      const usernameField = autofillUsernameRef.current;
      const passwordField = autofillPasswordRef.current;

      const usernameWasFilled =
        !!usernameField && usernameField.value.length > 0;

      const passwordWasFilled =
        !!passwordField && passwordField.value.length > 0;

      if (usernameWasFilled || passwordWasFilled) {
        setAutofillDetected(true);
      }
    };

    // Safari/Edge may autofill after initial render.
    const timers = [
      setTimeout(checkForAutofill, 500),
      setTimeout(checkForAutofill, 1000),
      setTimeout(checkForAutofill, 2500),
      setTimeout(checkForAutofill, 5000),
    ];

    return () => {
      cancelled = true;

      timers.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, [mode]);

  // ============================================================
  // RATE LIMIT STORAGE
  // ============================================================

  const getRateLimitData = () => {
    try {
      const saved = localStorage.getItem(
        RATE_LIMIT_STORAGE_KEY
      );

      if (!saved) {
        return {
          failedAttempts: 0,
          lockedUntil: 0,
        };
      }

      const data = JSON.parse(saved);

      return {
        failedAttempts:
          Number(data.failedAttempts) || 0,
        lockedUntil:
          Number(data.lockedUntil) || 0,
      };
    } catch {
      return {
        failedAttempts: 0,
        lockedUntil: 0,
      };
    }
  };

  const saveRateLimitData = (data) => {
    try {
      localStorage.setItem(
        RATE_LIMIT_STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch {
      // Ignore storage errors.
    }
  };

  const resetRateLimit = () => {
    try {
      localStorage.removeItem(
        RATE_LIMIT_STORAGE_KEY
      );
    } catch {
      // Ignore storage errors.
    }

    setRemainingLockTime(0);
  };

  // ============================================================
  // CHECK CURRENT RATE LIMIT
  // ============================================================

  const getRateLimitStatus = () => {
    const data = getRateLimitData();
    const now = Date.now();

    if (data.lockedUntil > now) {
      const secondsLeft = Math.ceil(
        (data.lockedUntil - now) / 1000
      );

      return {
        locked: true,
        secondsLeft,
        failedAttempts: data.failedAttempts,
      };
    }

    if (
      data.lockedUntil !== 0 &&
      data.lockedUntil <= now
    ) {
      resetRateLimit();

      return {
        locked: false,
        secondsLeft: 0,
        failedAttempts: 0,
      };
    }

    return {
      locked: false,
      secondsLeft: 0,
      failedAttempts: data.failedAttempts,
    };
  };

  // ============================================================
  // LOCKOUT COUNTDOWN
  // ============================================================

  useEffect(() => {
    if (mode !== "login") {
      setRemainingLockTime(0);
      return;
    }

    const updateTimer = () => {
      const status = getRateLimitStatus();

      setRemainingLockTime(
        status.locked ? status.secondsLeft : 0
      );
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [mode]);

  // ============================================================
  // RESET FORM WHEN INITIAL MODE CHANGES
  // ============================================================

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setFormData(EMPTY_FORM);
    setAutofillDetected(false);
  }, [initialMode]);

  // ============================================================
  // AUTO FOCUS
  // ============================================================

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [mode]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      credentials: "",
      attempts: "",
      rateLimit: "",
    }));
  };

  // ============================================================
  // CHANGE MODE
  // ============================================================

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrors({});
    setFormData(EMPTY_FORM);
    setAutofillDetected(false);
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (onSwitchMode) {
      onSwitchMode(newMode);
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const newErrors = {};

    const usernameRegex =
      /^[a-zA-Z0-9_]{3,20}$/;

    if (
      mode === "signup" &&
      !formData.name.trim()
    ) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username =
        "Username is required";
    } else if (
      !usernameRegex.test(
        formData.username.trim()
      )
    ) {
      newErrors.username =
        "Username must be 3–20 characters and contain only letters, numbers, or underscores";
    }

    if (mode !== "forgot") {
      if (!formData.password) {
        newErrors.password =
          "Password is required";
      } else if (
        formData.password.length < 6
      ) {
        newErrors.password =
          "Password must be at least 6 characters";
      }
    }

    if (mode === "signup") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Please confirm your password";
      } else if (
        formData.password !==
        formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // REGISTERED USERS
  // ============================================================

  const getRegisteredUsers = () => {
    try {
      const savedUsers =
        localStorage.getItem(
          "registeredUsers"
        );

      if (!savedUsers) {
        return [];
      }

      const users = JSON.parse(savedUsers);

      return Array.isArray(users)
        ? users
        : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users) => {
    try {
      localStorage.setItem(
        "registeredUsers",
        JSON.stringify(users)
      );
    } catch {
      // Ignore storage errors.
    }
  };

  // ============================================================
  // RECORD FAILED LOGIN
  // ============================================================

  const recordFailedLogin = () => {
    const current = getRateLimitData();

    const failedAttempts =
      current.failedAttempts + 1;

    if (
      failedAttempts >=
      MAX_LOGIN_ATTEMPTS
    ) {
      const lockedUntil =
        Date.now() +
        LOCKOUT_DURATION_MS;

      saveRateLimitData({
        failedAttempts,
        lockedUntil,
      });

      setRemainingLockTime(30);

      setErrors({
        rateLimit:
          "Too many failed login attempts. Please try again in 30 seconds.",
      });

      return;
    }

    saveRateLimitData({
      failedAttempts,
      lockedUntil: 0,
    });

    const attemptsLeft =
      MAX_LOGIN_ATTEMPTS -
      failedAttempts;

    setErrors({
      credentials:
        "Username or password is incorrect.",
      attempts:
        `${attemptsLeft} login attempt${
          attemptsLeft === 1
            ? ""
            : "s"
        } remaining.`,
    });
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = () => {
    const status = getRateLimitStatus();

    if (status.locked) {
      setIsLoading(false);

      setRemainingLockTime(
        status.secondsLeft
      );

      setErrors({
        rateLimit:
          `Too many failed login attempts. Please try again in ${status.secondsLeft} seconds.`,
      });

      return;
    }

    const registeredUsers =
      getRegisteredUsers();

    const username =
      formData.username.trim();

    const matchingUser =
      registeredUsers.find(
        (user) =>
          typeof user.username === "string" &&
          user.username.toLowerCase() ===
            username.toLowerCase() &&
          user.password ===
            formData.password
      );

    // ==========================================================
    // WRONG LOGIN
    // ==========================================================

    if (!matchingUser) {
      setIsLoading(false);
      recordFailedLogin();
      return;
    }

    // ==========================================================
    // CORRECT LOGIN
    // ==========================================================

    resetRateLimit();

    const loggedInUser = {
      name: matchingUser.name,
      username: matchingUser.username,
    };

    try {
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );
    } catch {
      // Ignore storage errors.
    }

    setIsLoading(false);
    setErrors({});

    if (triggerToast) {
      triggerToast(
        `Welcome back, ${loggedInUser.name}!`
      );
    }

    if (onSuccess) {
      onSuccess(loggedInUser);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (mode === "login") {
      const status =
        getRateLimitStatus();

      if (status.locked) {
        setRemainingLockTime(
          status.secondsLeft
        );

        setErrors({
          rateLimit:
            `Too many failed login attempts. Please try again in ${status.secondsLeft} seconds.`,
        });

        return;
      }
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // ========================================================
      // LOGIN
      // ========================================================

      if (mode === "login") {
        handleLogin();
        return;
      }

      // ========================================================
      // SIGNUP
      // ========================================================

      if (mode === "signup") {
        const registeredUsers =
          getRegisteredUsers();

        const username =
          formData.username.trim();

        const exists =
          registeredUsers.some(
            (user) =>
              typeof user.username === "string" &&
              user.username.toLowerCase() ===
                username.toLowerCase()
          );

        if (exists) {
          setIsLoading(false);

          setErrors({
            username:
              "This username is already taken. Please choose another.",
          });

          return;
        }

        const newUser = {
          name:
            formData.name.trim(),
          username,
          password:
            formData.password,
        };

        saveRegisteredUsers([
          ...registeredUsers,
          newUser,
        ]);

        setIsLoading(false);

        if (triggerToast) {
          triggerToast(
            "Account created successfully. Please log in."
          );
        }

        setMode("login");
        setFormData(EMPTY_FORM);
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);

        return;
      }

      // ========================================================
      // FORGOT PASSWORD
      // ========================================================

      if (mode === "forgot") {
        setIsLoading(false);

        if (triggerToast) {
          triggerToast(
            "Password reset functionality is not configured yet."
          );
        }

        setMode("login");
        setFormData(EMPTY_FORM);
        setErrors({});
      }
    }, 500);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="auth-form-container">

      {mode !== "forgot" && (
        <div
          className="auth-tabs"
          role="tablist"
        >
          <button
            type="button"
            className={`auth-tab-btn ${
              mode === "login"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleModeChange("login")
            }
            role="tab"
            aria-selected={
              mode === "login"
            }
            disabled={isLoading}
          >
            Log In
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${
              mode === "signup"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleModeChange("signup")
            }
            role="tab"
            aria-selected={
              mode === "signup"
            }
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="auth-forgot-header">
          <h3>Reset Password</h3>

          <p>
            Password reset is not currently
            configured. Please contact
            support if you need help.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="auth-form"
        noValidate
      >

        {/* ======================================================
            AUTOFILL LEAKAGE TEST
            ====================================================== */}

        <div
          aria-hidden="true"
          data-autofill-test="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <input
            ref={autofillUsernameRef}
            type="text"
            name="autofill-test-username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
          />

          <input
            ref={autofillPasswordRef}
            type="password"
            name="autofill-test-password"
            autoComplete="current-password"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* AUTOFILL RESULT */}

        {autofillDetected && (
          <div
            className="auth-field-error auth-credentials-error"
            role="alert"
          >
            ⚠️ Browser autofill populated a
            hidden/off-screen test field.
            Please review browser autofill
            behavior in Safari and Edge.
          </div>
        )}

        {/* ======================================================
            NAME
            ====================================================== */}

        {mode === "signup" && (
          <div className="auth-field-group">

            <label htmlFor="auth-name">
              Name
            </label>

            <div className="auth-input-wrapper">
              <input
                ref={firstInputRef}
                type="text"
                id="auth-name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="name"
                className={
                  errors.name
                    ? "error"
                    : ""
                }
              />
            </div>

            {errors.name && (
              <span className="auth-field-error">
                {errors.name}
              </span>
            )}
          </div>
        )}

        {/* ======================================================
            USERNAME
            ====================================================== */}

        <div className="auth-field-group">

          <label htmlFor="auth-username">
            Username
          </label>

          <div className="auth-input-wrapper">

            <input
              ref={
                mode !== "signup"
                  ? firstInputRef
                  : null
              }
              type="text"
              id="auth-username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={
                isLoading ||
                remainingLockTime > 0
              }
              className={
                errors.username
                  ? "error"
                  : ""
              }
              autoComplete="username"
            />

          </div>

          {errors.username && (
            <span className="auth-field-error">
              {errors.username}
            </span>
          )}
        </div>

        {/* ======================================================
            RATE LIMIT
            ====================================================== */}

        {mode === "login" &&
          errors.rateLimit && (
            <div
              className="auth-field-error auth-credentials-error"
              role="alert"
            >
              {errors.rateLimit}
            </div>
          )}

        {mode === "login" &&
          errors.credentials && (
            <div
              className="auth-field-error auth-credentials-error"
              role="alert"
            >
              {errors.credentials}
            </div>
          )}

        {mode === "login" &&
          errors.attempts && (
            <div
              className="auth-field-error"
              role="status"
            >
              {errors.attempts}
            </div>
          )}

        {/* ======================================================
            PASSWORD
            ====================================================== */}

        {mode !== "forgot" && (
          <div className="auth-field-group">

            <label htmlFor="auth-password">
              Password
            </label>

            <div className="auth-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="auth-password"
                name="password"
                placeholder={
                  mode === "login"
                    ? "Enter your password"
                    : "Min 6 characters"
                }
                value={formData.password}
                onChange={handleChange}
                disabled={
                  isLoading ||
                  remainingLockTime > 0
                }
                className={
                  errors.password
                    ? "error"
                    : ""
                }
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={isLoading}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {errors.password && (
              <span className="auth-field-error">
                {errors.password}
              </span>
            )}

          </div>
        )}

        {/* ======================================================
            CONFIRM PASSWORD
            ====================================================== */}

        {mode === "signup" && (
          <div className="auth-field-group">

            <label htmlFor="auth-confirmPassword">
              Confirm Password
            </label>

            <div className="auth-input-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="auth-confirmPassword"
                name="confirmPassword"
                placeholder="Retype password"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                disabled={isLoading}
                className={
                  errors.confirmPassword
                    ? "error"
                    : ""
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={isLoading}
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {errors.confirmPassword && (
              <span className="auth-field-error">
                {errors.confirmPassword}
              </span>
            )}

          </div>
        )}

        {/* ======================================================
            FORGOT PASSWORD
            ====================================================== */}

        {mode === "login" && (
          <div className="auth-forgot-password-link">

            <button
              type="button"
              onClick={() =>
                handleModeChange("forgot")
              }
              disabled={
                isLoading ||
                remainingLockTime > 0
              }
              className="text-link"
            >
              Forgot Password?
            </button>

          </div>
        )}

        {/* ======================================================
            SUBMIT
            ====================================================== */}

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={
            isLoading ||
            remainingLockTime > 0
          }
        >
          {isLoading ? (
            <span className="auth-spinner-wrapper">

              <span
                className="auth-spinner"
                aria-hidden="true"
              />

              {mode === "login" &&
                "Logging in..."}

              {mode === "signup" &&
                "Signing up..."}

              {mode === "forgot" &&
                "Processing..."}

            </span>
          ) : remainingLockTime > 0 ? (
            `Try again in ${remainingLockTime}s`
          ) : (
            <>
              {mode === "login" &&
                "Log In"}

              {mode === "signup" &&
                "Create Account"}

              {mode === "forgot" &&
                "Continue"}
            </>
          )}
        </button>

      </form>

      {/* ========================================================
          FOOTER
          ======================================================== */}

      <div className="auth-form-footer">

        {mode === "login" && (
          <p>
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() =>
                handleModeChange("signup")
              }
              disabled={isLoading}
              className="text-link highlight"
            >
              Sign Up
            </button>
          </p>
        )}

        {mode === "signup" && (
          <p>
            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                handleModeChange("login")
              }
              disabled={isLoading}
              className="text-link highlight"
            >
              Log In
            </button>
          </p>
        )}

        {mode === "forgot" && (
          <p>
            Remember your password?{" "}

            <button
              type="button"
              onClick={() =>
                handleModeChange("login")
              }
              disabled={isLoading}
              className="text-link highlight"
            >
              Back to Log In
            </button>
          </p>
        )}

      </div>

    </div>
  );
}