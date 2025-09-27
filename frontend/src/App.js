import React, { useState, useCallback } from "react";
import AuthCard from "./components/AuthCard";
import CodeEditor from "./components/CodeEditor";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");

  const handleAuth = useCallback((u) => {
    setUser(u);
    setStatus("");
  }, []);

  const handleSignOut = useCallback(() => {
    setUser(null);
    setStatus("");
  }, []);

  const handleValidate = useCallback((code) => {
    setStatus("Code validation requested...");
    console.log("[frontend] Validate requested:", code.slice(0, 120));
    setTimeout(() => setStatus(""), 2000);
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleInsertSample = useCallback(() => {
    setStatus("Sample code loaded");
    setTimeout(() => setStatus(""), 1500);
  }, []);

  const handleAISuggestion = useCallback((code) => {
    setStatus("AI suggestion feature - backend integration pending");
    console.log("[frontend] AI suggestion requested for code:", code.slice(0, 100));
    setTimeout(() => setStatus(""), 3000);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1 className="brand-title">
            <span className="brand-yantra">Yantra</span>
            <span className="brand-bhashi">Bhashi</span>
          </h1>
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
              defaultTheme="vs-dark"
              initialCode={code}
              onValidate={handleValidate}
              onInsertSample={handleInsertSample}
              onChange={handleCodeChange}
              onAISuggestion={handleAISuggestion}
              height="600px"
            />
            {status && <div className="status">{status}</div>}
          </div>
        )}
      </main>
    </div>
  );
}
