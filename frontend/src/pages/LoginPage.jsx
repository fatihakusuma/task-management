import { useState } from "react";
import { login, saveSession } from "../api.js";

export default function LoginPage({ onSuccess, message }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await login(email.trim(), password);
      saveSession(data);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message === "Login failed" ? "Email atau password salah." : err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="form box login-box" onSubmit={handleSubmit}>
        <h2>Task Management</h2>
        <p className="muted">Masuk untuk mengelola tugas kuliah.</p>

        {message && <p className="notice">{message}</p>}
        {error && <p className="error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
}
