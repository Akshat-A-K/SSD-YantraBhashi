import React from "react";
import apiService from "../services/apiService";

export default function AuthCard({ onAuth }) {
  const [mode, setMode] = React.useState("signin"); // 'signin' | 'signup'
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("student"); // 'student' | 'instructor'
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!username || !email || !password || !role) {
          setError("Please fill in all fields.");
          return;
        }
        
  await apiService.signup({ username, email, password, role });
  setError("");
  setMode("signin");
  setStatus("Account created successfully. Please sign in.");
  setTimeout(() => setStatus(""), 5000);
      } else {
        if ((!username && !email) || !password) {
          setError("Please enter username/email and password.");
          return;
        }
        
        const credentials = { password };
        if (username) credentials.username = username;
        if (email) credentials.email = email;
        
        const response = await apiService.signin(credentials);
        
        if (response.success) {
          // User info is now included in the signin response
          onAuth?.(response.user);
        }
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card auth-card" aria-label="Authentication">
      <div className="card-header">
        <h2>{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
        <p className="muted">Connect to YantraBhashi Code Editor</p>
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

        {mode === "signup" && (
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
        )}

        {error ? <div className="error">{error}</div> : null}
        {status ? <div className="status success">{status}</div> : null}

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Loading..." : (mode === "signin" ? "Sign In" : "Create Account")}
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
