import { ArrowRight, LockKeyhole, WalletCards } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { ThemeToggle } from "../components/ThemeToggle";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { computePasswordStrength } from "../utils/password";

const initialLogin = {
  username: "",
  password: "",
};

const initialRegister = {
  username: "",
  first_name: "",
  email: "",
  password: "",
  password_confirm: "",
};

const REGISTER_FIELDS = ["username", "first_name", "email", "password", "password_confirm"];
const LOGIN_FIELDS = ["username", "password"];

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

function extractFieldErrors(data, fields) {
  if (!data || typeof data !== "object") {
    return {};
  }
  const result = {};
  for (const field of fields) {
    const value = data[field];
    if (Array.isArray(value)) {
      result[field] = value.map(String).join(" ");
    } else if (typeof value === "string") {
      result[field] = value;
    }
  }
  return result;
}

export function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const nextPath = location.state?.from?.pathname || "/dashboard";

  function updateLogin(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function updateRegister(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!loginForm.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (!loginForm.password) {
      nextErrors.password = "Password is required.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });
      toast.success("Welcome back", "Your financial dashboard is ready.");
      navigate(nextPath, { replace: true });
    } catch (error) {
      const fieldErrors = extractFieldErrors(error.data, LOGIN_FIELDS);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      }
      toast.error("Login failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!registerForm.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (!registerForm.email.trim()) {
      nextErrors.email = "Email is required.";
    }
    if (!registerForm.password) {
      nextErrors.password = "Choose a password.";
    }
    if (registerForm.password !== registerForm.password_confirm) {
      nextErrors.password_confirm = "Passwords must match.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ...registerForm,
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        first_name: registerForm.first_name.trim(),
      });
      toast.success("Account created", "Starter categories were added to your workspace.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const fieldErrors = extractFieldErrors(error.data, REGISTER_FIELDS);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      }
      toast.error("Registration failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--hero">
        <div className="brand-mark brand-mark--hero">
          <span className="brand-mark__badge">
            <WalletCards size={20} />
          </span>
          <div>
            <strong>BudgetFlow</strong>
            <p>Beautiful budgeting for real life.</p>
          </div>
        </div>

        <div className="auth-copy">
          <span className="eyebrow">Modern money planning</span>
          <h1>Build a healthier budget rhythm without the spreadsheet drag.</h1>
          <p>
            Organize categories, move money instantly, and see your spending story in a polished
            dashboard that feels calm on every screen.
          </p>
        </div>

        <div className="hero-metrics">
          <article className="surface-card hero-metrics__card">
            <strong>Category balances</strong>
            <p>See exactly what is available in every bucket before you spend.</p>
          </article>
          <article className="surface-card hero-metrics__card">
            <strong>Fast transaction flow</strong>
            <p>Log income, track expenses, and allocate to envelopes without losing context.</p>
          </article>
          <article className="surface-card hero-metrics__card">
            <strong>Readable insights</strong>
            <p>Simple charts and clean summaries keep the signal strong.</p>
          </article>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-panel__topbar">
          <ThemeToggle />
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrors({});
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
            onClick={() => {
              setMode("register");
              setErrors({});
            }}
          >
            Create account
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-heading">
              <h2>Welcome back</h2>
              <p>Pick up where you left off and keep your plan moving.</p>
            </div>

            <label className="field">
              <span>Username</span>
              <input
                name="username"
                value={loginForm.username}
                onChange={updateLogin}
                placeholder="Enter your username"
              />
              {errors.username ? <small>{errors.username}</small> : null}
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={updateLogin}
                placeholder="Enter your password"
              />
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <LockKeyhole size={16} />
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-heading">
              <h2>Start your budget workspace</h2>
              <p>Create an account and get starter categories instantly.</p>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Username</span>
                <input
                  name="username"
                  value={registerForm.username}
                  onChange={updateRegister}
                  placeholder="Choose a username"
                />
                {errors.username ? <small>{errors.username}</small> : null}
              </label>

              <label className="field">
                <span>Display name</span>
                <input
                  name="first_name"
                  value={registerForm.first_name}
                  onChange={updateRegister}
                  placeholder="How should we greet you?"
                />
              </label>

              <label className="field field--full">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={updateRegister}
                  placeholder="you@example.com"
                />
                {errors.email ? <small>{errors.email}</small> : null}
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={updateRegister}
                  placeholder="Create a password"
                />
                {errors.password ? <small>{errors.password}</small> : null}
                {registerForm.password ? (
                  <PasswordStrengthMeter password={registerForm.password} />
                ) : null}
              </label>

              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="password_confirm"
                  value={registerForm.password_confirm}
                  onChange={updateRegister}
                  placeholder="Repeat your password"
                />
                {errors.password_confirm ? <small>{errors.password_confirm}</small> : null}
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <ArrowRight size={16} />
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
