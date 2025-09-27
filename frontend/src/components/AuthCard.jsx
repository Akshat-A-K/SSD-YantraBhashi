import React from "react";

export default function AuthCard({ onAuth }) {
  const [mode, setMode] = React.useState("signin"); // 'signin' | 'signup'
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("student"); // 'student' | 'instructor'
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please enter username, email and password.");
      return;
    }
    // Pure frontend simulation - in real app, this would call your login API
    onAuth?.({ username, email, role });
  };

  return (
    <section className="card auth-card" aria-label="Authentication">
      <div className="card-header">
        <h2>{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
        <p className="muted">No backend; this simulates auth locally.</p>
      </div>

      <form className="card-body" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />
        </label>

        <label className="field">
          <span>Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>

        {error ? <div className="error">{error}</div> : null}

        <div className="actions">
          <button className="btn btn-primary" type="submit">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
      </form>
    </section>
  );
}
