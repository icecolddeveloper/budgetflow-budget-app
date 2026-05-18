import { ArrowLeft, CheckCircle2, Mail, Send, WalletCards } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { authApi } from "../api/client";
import { ThemeToggle } from "../components/ThemeToggle";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter the email tied to your account.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(trimmed);
      setSent(true);
    } catch (err) {
      setError(err?.message || "We could not send a reset link right now.");
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
        {sent ? (
          <div className="auth-aside-card__success">
            <span className="auth-aside-card__icon auth-aside-card__icon--success">
              <CheckCircle2 size={26} />
            </span>
            <h1>Check your inbox</h1>
            <p>
              If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way.
              The link expires in a few hours.
            </p>
            <Link to="/auth" className="btn btn-primary btn-block">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-heading">
              <span className="auth-aside-card__icon">
                <Mail size={22} />
              </span>
              <h1>Reset your password</h1>
              <p>
                Enter the email tied to your BudgetFlow account and we'll send a secure link to
                choose a new password.
              </p>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
              {error ? <small>{error}</small> : null}
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <Send size={16} />
              {submitting ? "Sending link..." : "Send reset link"}
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
