import React from "react";
import AuthCard from "./components/AuthCard";
import CodeEditor from "./components/CodeEditor";
import "./style.css";

export default function App() {
  const [user, setUser] = React.useState(null);
  const [status, setStatus] = React.useState("");

  const handleAuth = (u) => {
    setUser(u);
    setStatus("");
  };

  const handleSignOut = () => {
    setUser(null);
    setStatus("");
  };

  const handleValidate = (code) => {
    setStatus("Request sent. Waiting for backend...");
    console.log("[frontend] Validate requested:", code.slice(0, 120));
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="logo">YB</span>
          <h1>Yantrabhashi Playground</h1>
        </div>
        {user && (
          <div className="user-row">
            <span className="user-email">{user.email}</span>
            <button className="btn btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!user ? (
          <AuthCard onAuth={handleAuth} />
        ) : (
          <div className="editor-panel">
            <CodeEditor
              defaultTheme="light"
              onValidate={handleValidate}
              onInsertSample={() => console.log("[frontend] Insert sample clicked")}
            />
            {status ? <div className="status">{status}</div> : null}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Pure frontend demo. Backend will be connected separately.</p>
      </footer>
    </div>
  );
}
