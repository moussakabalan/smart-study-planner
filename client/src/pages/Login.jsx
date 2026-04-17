import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Could not log in";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
      <h1 className="page-title">Log In</h1>
      <p className="page-lead">Welcome back. Let&apos;s get your study plan loaded.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p style={{ marginTop: 12 }}>
          <button type="submit" disabled={busy}>
            {busy ? "Signing In…" : "Sign In"}
          </button>
        </p>
      </form>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

        <p className="page-lead">
          No Account Yet? <Link to="/register">Create an Account</Link>.
        </p>
      </div>
    </div>
  );
}