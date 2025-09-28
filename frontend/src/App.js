import React, { useState, useCallback, useEffect } from "react";
import AuthCard from "./components/AuthCard";
import CodeEditor from "./components/CodeEditor";
import InstructorDashboard from "./components/InstructorDashboard";
import StudentSubmissions from "./components/StudentSubmissions";
import apiService from "./services/apiService";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");
  const [instructorFeedback, setInstructorFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuth = useCallback((u) => {
    setUser(u);
    setStatus("");
    
    localStorage.setItem('user', JSON.stringify(u));
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setStatus("");
      
      localStorage.removeItem('user');
    }
  }, []);

  const handleValidate = useCallback(async (code) => {
  setStatus("Validating code...");
    try {
      const response = await apiService.validateCode(code);
      if (response.success) {
        setStatus("Code validated successfully!");
      } else {
        setStatus("Code validation failed. Check for errors.");
      }
    } catch (error) {
      setStatus("Validation error: " + error.message);
    }
    setTimeout(() => setStatus(""), 3000);
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleInsertSample = useCallback(() => {
    setStatus("Sample code loaded");
    setTimeout(() => setStatus(""), 1500);
  }, []);

  const handleAISuggestion = useCallback(async (code) => {
  setStatus("Requesting AI suggestion...");
    try {
      const res = await apiService.aiSuggest(code);
      setStatus("AI suggestion ready");
      
      return res;
    } catch (error) {
      console.error('[frontend] AI suggestion error:', error);
      setStatus('AI suggestion failed: ' + (error.message || 'unknown'));
      throw error;
    } finally {
      setTimeout(() => setStatus(""), 3000);
    }
  }, []);

  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Clear feedback when user changes
  useEffect(() => {
    setInstructorFeedback(null);
  }, [user?.id]);

  // Load instructor feedback for students
  useEffect(() => {
    if (user && user.role === "student") {
      const loadFeedback = async () => {
        try {
          const response = await apiService.getUserSubmissions();
          
          // Get submissions for the current user only
          const userSubmissions = response.items || response.submissions || [];
          
          // Get the latest submission with feedback for this specific user
          const userSpecificSubmissions = userSubmissions.filter(sub => {
            const isUserMatch = sub.user_id === user.id || sub.userId === user.id;
            return isUserMatch;
          });
          
          const latestSubmission = userSpecificSubmissions
            .find(sub => sub.instructor_feedback && sub.instructor_feedback.trim() !== '');
          
          if (latestSubmission?.instructor_feedback) {
            setInstructorFeedback(latestSubmission.instructor_feedback);
          } else {
            setInstructorFeedback(null);
          }
        } catch (error) {
          console.error("Error loading feedback:", error);
          setInstructorFeedback(null);
        }
      };
      loadFeedback();
    } else {
      // Clear feedback for non-students
      setInstructorFeedback(null);
    }
  }, [user]);

  return (
    <div className="app">
      {user && (
        <header className="app-header">
          <div className="brand">
            <h1 className="brand-title">
              <span className="brand-yantra">Yantra</span>
              <span className="brand-bhashi">Bhashi</span>
            </h1>
          </div>
          <div className="user-row">
            <span className="user-email">{user.username} ({user.role})</span>
            <button className="btn btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>
      )}

      <main className={user ? "app-main" : "app-main auth"}>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : !user ? (
          <AuthCard onAuth={handleAuth} />
        ) : user.role === "instructor" ? (
          <InstructorDashboard user={user} onSignOut={handleSignOut} />
        ) : (
          <div className="main-flex-row" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div className="submissions-sidebar" style={{ minWidth: '340px', maxWidth: '400px', flex: '0 0 340px' }}>
              <StudentSubmissions user={user} />
            </div>
            <div className="editor-panel" style={{ flex: 1 }}>
              <CodeEditor
                defaultTheme="vs-dark"
                initialCode={code}
                onValidate={handleValidate}
                onInsertSample={handleInsertSample}
                onChange={handleCodeChange}
                onAISuggestion={handleAISuggestion}
                height="600px"
                instructorFeedback={instructorFeedback}
              />
              {status && <div className="status">{status}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
