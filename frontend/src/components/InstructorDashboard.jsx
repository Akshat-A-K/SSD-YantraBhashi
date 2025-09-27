import React, { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";

export default function InstructorDashboard({ user, onSignOut }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading students
    setLoading(true);
    setTimeout(() => {
      setStudents([
        { id: 1, username: "john_doe", email: "john@example.com", submissionsCount: 3 },
        { id: 2, username: "jane_smith", email: "jane@example.com", submissionsCount: 2 },
        { id: 3, username: "alex_wilson", email: "alex@example.com", submissionsCount: 1 },
        { id: 4, username: "sarah_jones", email: "sarah@example.com", submissionsCount: 4 },
        { id: 5, username: "mike_brown", email: "mike@example.com", submissionsCount: 0 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedSubmission(null);
    setSubmissions([]);
    
    // Simulate loading submissions for selected student
    setLoading(true);
    setTimeout(() => {
      const mockSubmissions = [
        {
          id: 1,
          studentId: student.id,
          title: "Hello World Program",
          code: `# Hello World program
PADAM message:VARTTAI = "Hello World";
CHATIMPU(message);`,
          submittedAt: "2024-01-15T10:30:00Z",
          status: "submitted"
        },
        {
          id: 2,
          studentId: student.id,
          title: "Addition Program",
          code: `# Addition program
PADAM a:ANKHE;
PADAM b:ANKHE;
PADAM sum:ANKHE = 0;
CHEPPU(a);
CHEPPU(b);
sum = a + b;
CHATIMPU("The Sum is:");
CHATIMPU(sum);`,
          submittedAt: "2024-01-16T14:20:00Z",
          status: "submitted"
        },
        {
          id: 3,
          studentId: student.id,
          title: "Loop Practice",
          code: `# Printing Sum of First 10 numbers
PADAM i:ANKHE;
PADAM sum:ANKHE = 0;
MALLI-MALLI (PADAM i:ANKHE = 1; i <= 10; i = i + 1) [
  sum = sum + i;
]
CHATIMPU("Sum of first 10 numbers is:");
CHATIMPU(sum);`,
          submittedAt: "2024-01-17T09:15:00Z",
          status: "submitted"
        }
      ];
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 800);
  };

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleValidate = (code) => {
    setStatus("Validating student code...");
    console.log("[instructor] Validating code:", code.slice(0, 120));
    setTimeout(() => setStatus(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    // For instructor view, code changes are read-only
    console.log("[instructor] Code viewed:", newCode.slice(0, 100));
  };

  const handleInsertSample = () => {
    setStatus("Sample code feature not available in instructor mode");
    setTimeout(() => setStatus(""), 1500);
  };

  const handleAISuggestion = (code) => {
    setStatus("AI suggestion feature not available in instructor mode");
    setTimeout(() => setStatus(""), 1500);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Instructor Dashboard</h2>
          <p>Welcome, {user.username} ({user.role})</p>
        </div>
        <button className="btn btn-ghost" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      <div className="dashboard-content">
        {/* Students List */}
        <div className="students-panel">
          <div className="panel-header">
            <h3>Students ({students.length})</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search students..."
                className="search-input"
              />
            </div>
          </div>
          
          <div className="students-list">
            {loading ? (
              <div className="loading">Loading students...</div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className={`student-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                  onClick={() => handleStudentSelect(student)}
                >
                  <div className="student-info">
                    <div className="student-name">{student.username}</div>
                    <div className="student-email">{student.email}</div>
                  </div>
                  <div className="student-stats">
                    <span className="submissions-count">
                      {student.submissionsCount} submissions
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions List */}
        {selectedStudent && (
          <div className="submissions-panel">
            <div className="panel-header">
              <h3>Submissions by {selectedStudent.username}</h3>
            </div>
            
            <div className="submissions-list">
              {loading ? (
                <div className="loading">Loading submissions...</div>
              ) : submissions.length > 0 ? (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`submission-item ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
                    onClick={() => handleSubmissionSelect(submission)}
                  >
                    <div className="submission-info">
                      <div className="submission-title">{submission.title}</div>
                      <div className="submission-date">
                        {formatDate(submission.submittedAt)}
                      </div>
                    </div>
                    <div className="submission-status">
                      <span className={`status-badge ${submission.status}`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-submissions">
                  No submissions found for this student.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Code Editor */}
        {selectedSubmission && (
          <div className="code-panel">
            <div className="panel-header">
              <h3>{selectedSubmission.title}</h3>
              <div className="submission-meta">
                <span>Submitted: {formatDate(selectedSubmission.submittedAt)}</span>
                <span className={`status-badge ${selectedSubmission.status}`}>
                  {selectedSubmission.status}
                </span>
              </div>
            </div>
            
            <div className="editor-container">
              <CodeEditor
                defaultTheme="vs-dark"
                initialCode={selectedSubmission.code}
                onValidate={handleValidate}
                onInsertSample={handleInsertSample}
                onChange={handleCodeChange}
                onAISuggestion={handleAISuggestion}
                height="500px"
                readOnly={true}
              />
              {status && <div className="status">{status}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
