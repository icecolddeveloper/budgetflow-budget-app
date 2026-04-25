import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { authApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { isAuthenticated, refreshProfile } = useAuth();
  const [status, setStatus] = useState(token ? "pending" : "missing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      setMessage("This verification link is missing its token.");
      return;
    }

    let cancelled = false;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus("success");
        setMessage("Your email is verified. You can close this tab or head back to the app.");
        if (isAuthenticated && typeof refreshProfile === "function") {
          refreshProfile().catch(() => {});
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error?.message || "We could not verify this link.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, refreshProfile]);

  const icon = {
    pending: <Loader2 size={28} className="spin" />,
    success: <CheckCircle2 size={28} />,
    error: <AlertCircle size={28} />,
    missing: <AlertCircle size={28} />,
  }[status];

  const title = {
    pending: "Verifying your email...",
    success: "Email verified",
    error: "We could not verify this link",
    missing: "Missing verification token",
  }[status];

  return (
    <main className="verify-email-page">
      <section className="surface-card verify-email-card">
        <span className={`verify-email-card__icon verify-email-card__icon--${status}`}>
          {icon}
        </span>
        <h1>{title}</h1>
        <p>{message || "Hold tight while we confirm your account."}</p>
        <div className="verify-email-card__actions">
          <Link to={isAuthenticated ? "/dashboard" : "/auth"} className="btn btn-primary">
            {isAuthenticated ? "Back to dashboard" : "Continue to sign in"}
          </Link>
        </div>
      </section>
    </main>
  );
}
