import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "../api/client";
import { PasswordInput } from "../components/PasswordInput";
import { ThemeToggle } from "../components/ThemeToggle";
import { computePasswordStrength } from "../utils/password";

function PasswordStrengthMeter({ password }) {
  const { score, label } = computePasswordStrength(password);
  return (
    <div className="password-strength" aria-live="polite">
      <div className="password-strength__track">
        <span
          className={`password-strength__fill password-strength__fill--${score}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <small className={`password-strength__label password-strength__label--${score}`}>
        {label}
      </small>
    </div>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const missingToken = !uid || !token;

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const nextErrors = {};
    if (!password) {
      nextErrors.password = "Choose a new password.";
    }
    if (password !== confirm) {
      nextErrors.password_confirm = "Passwords must match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        password,
        password_confirm: confirm,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2400);
    } catch (err) {
      const data = err?.data || {};
      const next = {};
      if (typeof data.password === "string") next.password = data.password;
      if (Array.isArray(data.password)) next.password = data.password.join(" ");
      if (typeof data.password_confirm === "string") {
        next.password_confirm = data.password_confirm;
      }
      setErrors(next);
      setServerError(
        data.token || err?.message || "We could not reset the password. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-aside-page">
      <div className="auth-aside-page__topbar">
        <Link to="/auth" className="brand-mark brand-mark--inline">
          <span className="brand-mark__badge">
            <WalletCards size={18} />
          </span>
          <strong>BudgetFlow</strong>
        </Link>
        <ThemeToggle />
      </div>

      <section className="surface-card auth-aside-card">
        {missingToken ? (
          <div className="auth-aside-card__success">
            <span className="auth-aside-card__icon auth-aside-card__icon--error">
              <AlertCircle size={26} />
            </span>
            <h1>This reset link is incomplete</h1>
            <p>The reset link is missing required information. Request a fresh one.</p>
            <Link to="/forgot-password" className="btn btn-primary btn-block">
              Request a new link
            </Link>
          </div>
        ) : success ? (
          <div className="auth-aside-card__success">
            <span className="auth-aside-card__icon auth-aside-card__icon--success">
              <CheckCircle2 size={26} />
            </span>
            <h1>Password updated</h1>
            <p>You're being sent to sign in with your new password.</p>
            <Link to="/auth" className="btn btn-primary btn-block">
              Go to sign in now
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-heading">
              <span className="auth-aside-card__icon">
                <KeyRound size={22} />
              </span>
              <h1>Choose a new password</h1>
              <p>Pick something strong. We'll sign you in next.</p>
            </div>

            {serverError ? (
              <div className="auth-aside-card__alert">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            ) : null}

            <label className="field">
              <span>New password</span>
              <PasswordInput
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {errors.password ? <small>{errors.password}</small> : null}
              {password ? <PasswordStrengthMeter password={password} /> : null}
            </label>

            <label className="field">
              <span>Confirm password</span>
              <PasswordInput
                name="password_confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {errors.password_confirm ? <small>{errors.password_confirm}</small> : null}
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <KeyRound size={16} />
              {submitting ? "Updating..." : "Update password"}
            </button>

            <Link to="/auth" className="link-button auth-aside-card__back">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
