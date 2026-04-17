import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
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
      await register(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Could not register";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
      <h1 className="page-title">Create Account</h1>
      <p className="page-lead">Set up your own planner space in under a minute.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <p style={{ marginTop: 12 }}>
          <button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create Account"}
          </button>
        </p>
      </form>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

        <p className="page-lead">
          Already Have an Account? <Link to="/login">Log In</Link>.
        </p>
      </div>
    </div>
  );
}