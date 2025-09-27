
import React, { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import apiService from "../services/apiService";

export default function InstructorDashboard({ user, onSignOut }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load students from API
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAllStudents();
        setStudents(response.students);
        setFilteredStudents(response.students);
      } catch (error) {
        setStatus("Error loading students: " + error.message);
        // Fallback to mock data if API fails
        const mockStudents = [
          { id: 1, username: "john_doe", email: "john@example.com", submissionsCount: 3 },
          { id: 2, username: "jane_smith", email: "jane@example.com", submissionsCount: 2 },
          { id: 3, username: "alex_wilson", email: "alex@example.com", submissionsCount: 1 },
          { id: 4, username: "sarah_jones", email: "sarah@example.com", submissionsCount: 4 },
          { id: 5, username: "mike_brown", email: "mike@example.com", submissionsCount: 0 }
        ];
        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
      } finally {
        setLoading(false);
      }
    };
    
    loadStudents();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setSelectedSubmission(null);
    setSubmissions([]);
    
    // Load submissions for selected student
    setLoading(true);
    try {
      const response = await apiService.getStudentSubmissions(student.id);
      setSubmissions(response.submissions || []);
    } catch (error) {
      setStatus("Error loading submissions: " + error.message);
      // Fallback to mock data if API fails
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setFeedbackText(submission.instructor_feedback || "");
  };

  const handleProvideFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission) return;
    
    setSubmittingFeedback(true);
    try {
      await apiService.verifySubmission(selectedSubmission.id, feedbackText);
  setStatus("Feedback submitted successfully.");
      
      // Update the submission in the list
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, instructor_feedback: feedbackText, instructor_verified_at: new Date().toISOString() }
          : sub
      ));
      
      setShowFeedbackModal(false);
      setFeedbackText("");
    } catch (error) {
      setStatus("Error submitting feedback: " + error.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackText("");
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
    // Call backend AI suggestion endpoint and show result
    (async () => {
      setStatus("Requesting AI suggestion...");
      try {
  // Provide submission id and any known errors for context
  const res = await apiService.aiSuggest(code, { submissionId: selectedSubmission?.id, errors: selectedSubmission?.errors || [] });
        if (res && (res.correctedCode || res.corrected)) {
          setStatus("AI suggestion received");
          // Normalize to `correctedCode` for UI consumption
          const normalized = { correctedCode: res.correctedCode || res.corrected, notes: res.notes || res.notes };
          setSelectedSubmission(prev => prev ? { ...prev, aiSuggestion: normalized } : prev);
        } else {
          setStatus('No suggestions returned by AI');
        }
      } catch (err) {
        setStatus('Error from AI service: ' + err.message);
      }
      setTimeout(() => setStatus(''), 3000);
    })();
  };

  const handleApplyAISuggestion = (apply) => {
    if (!selectedSubmission || !selectedSubmission.aiSuggestion) return;
    if (apply) {
      const corrected = selectedSubmission.aiSuggestion.corrected || selectedSubmission.aiSuggestion.corrections?.[0]?.text;
      if (corrected) {
        setSelectedSubmission(prev => ({ ...prev, code: corrected }));
        setStatus('Applied AI suggestion to the editor');
        setTimeout(() => setStatus(''), 2000);
      }
    } else {
      setStatus('AI suggestion dismissed');
      setTimeout(() => setStatus(''), 1500);
    }
    // Remove stored aiSuggestion after action
    setSelectedSubmission(prev => prev ? { ...prev, aiSuggestion: undefined } : prev);
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
                placeholder="Search by username..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="students-list">
            {loading ? (
              <div className="loading">Loading students...</div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
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
            ) : (
              <div className="no-submissions">
                {searchTerm ? `No students found matching "${searchTerm}"` : "No students found"}
              </div>
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
                <button 
                  className="feedback-btn"
                  onClick={handleProvideFeedback}
                  title="Provide feedback to student"
                >
                  Provide Feedback
                </button>
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
                onApplyCorrection={(apply) => handleApplyAISuggestion(apply)}
                height="500px"
                readOnly={true}
              />
              {status && <div className="status">{status}</div>}
              {selectedSubmission.aiSuggestion && (
                <div className="ai-suggestion-panel">
                  <h4>AI Suggestion</h4>
                  <div className="ai-suggestion-content">
                    <pre>{selectedSubmission.aiSuggestion.corrected || JSON.stringify(selectedSubmission.aiSuggestion, null, 2)}</pre>
                  </div>
                  <div className="ai-suggestion-actions">
                    <button className="btn" onClick={() => handleApplyAISuggestion(true)}>Apply</button>
                    <button className="btn btn-ghost" onClick={() => handleApplyAISuggestion(false)}>Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="feedback-modal">
              <div className="modal-header">
              <h3>Provide Feedback</h3>
              <button 
                className="close-btn"
                onClick={handleCloseFeedbackModal}
                aria-label="Close feedback modal"
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="feedback-info">
                <p><strong>Student:</strong> {selectedStudent?.username}</p>
                <p><strong>Submission:</strong> {selectedSubmission?.title}</p>
              </div>
              <div className="feedback-form">
                <label htmlFor="feedback-text">Your Feedback:</label>
                <textarea
                  id="feedback-text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide constructive feedback to help the student improve..."
                  rows={6}
                  className="feedback-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost"
                onClick={handleCloseFeedbackModal}
                disabled={submittingFeedback}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || !feedbackText.trim()}
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
