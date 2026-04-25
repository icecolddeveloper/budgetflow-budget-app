import { Mail } from "lucide-react";
import { useState } from "react";

import { authApi } from "../api/client";
import { useToast } from "./ToastProvider";

export function UnverifiedBanner({ email }) {
  const toast = useToast();
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await authApi.resendVerification();
      toast.success(
        "Verification email sent",
        email ? `Check ${email} for the link.` : "Check your inbox for the link."
      );
    } catch (error) {
      toast.error("Could not resend", error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="unverified-banner" role="status">
      <span className="unverified-banner__icon">
        <Mail size={16} />
      </span>
      <div className="unverified-banner__copy">
        <strong>Verify your email</strong>
        <p>
          We sent a link to {email || "your inbox"}. Click it to confirm your account.
        </p>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleResend}
        disabled={sending}
      >
        {sending ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
}
