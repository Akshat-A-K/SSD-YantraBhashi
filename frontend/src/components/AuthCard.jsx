import React from "react";
import apiService from "../services/apiService";

export default function AuthCard({ onAuth }) {
  const [mode, setMode] = React.useState("signin"); 
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [identifier, setIdentifier] = React.useState(""); 
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("student"); 
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!username || !email || !password || !role) {
          setError("Please fill in all fields.");
          setLoading(false);
          return;
        }
        
  await apiService.signup({ username, email, password, role });
  setError("");
  setMode("signin");
  setStatus("Account created successfully. Please sign in.");
  setTimeout(() => setStatus(""), 5000);
      } else {
        if (!identifier || !password) {
          setError("Please enter username/email and password.");
          setLoading(false);
          return;
        }
        
        const credentials = { password };
        if (identifier.includes("@")) {
          credentials.email = identifier.trim();
        } else {
          credentials.username = identifier.trim();
        }
        const response = await apiService.signin(credentials);
        
        if (response.success) {
          
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
        <div className="card-header auth-header">
          <div className="auth-brand-container">
            <h1 className="brand-title auth-brand">
              <span className="brand-yantra">Yantra</span><span className="brand-bhashi">Bhashi</span>
            </h1>
            <div className="brand-subtitle">Code Editor Platform</div>
          </div>
          <h2 className="auth-title">{mode === "signin" ? "Welcome Back" : "Join YantraBhashi"}</h2>
          <p className="muted auth-subtitle">
            {mode === "signin" 
              ? "Sign in to continue to your coding journey" 
              : "Create your account and start coding with AI assistance"
            }
          </p>
        </div>

        <form className="card-body auth-form" onSubmit={handleSubmit}>
          {mode === 'signin' ? (
            <>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    Username or Email
                  </span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter your email or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    Password
                  </span>
                  <div className="password-field">
                    <input
                      className="input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    Username
                  </span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    Email Address
                  </span>
                  <input
                    className="input"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    Password
                  </span>
                  <div className="password-field">
                    <input
                      className="input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>
              <div className="form-group">
                <label className="field">
                  <span className="form-label">
                    I am a
                  </span>
                  <select
                    className="select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {error ? (
            <div className="error-message">
              {error}
            </div>
          ) : null}
          {status ? (
            <div className="status success">
              {status}
            </div>
          ) : null}

          <div className="actions auth-actions">
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-content">
                  <span className="spinner" aria-hidden="true" />
                  <span>Processing…</span>
                </span>
              ) : (
                <span className="btn-content">{mode === "signin" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost auth-toggle-btn"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setStatus(""); setPassword(""); setIdentifier(""); }}
              disabled={loading}
            >
              {mode === "signin" ? "Need an account?" : "Have an account?"}
            </button>
          </div>
        </form>
      </section>
  );
}
