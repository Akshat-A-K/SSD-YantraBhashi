import React, { useEffect, useRef, useState } from "react";
import apiService from "../services/apiService";

export default function StudentSubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Keep Show Code/Feedback open even after polling refresh
  const [openCodeIds, setOpenCodeIds] = useState(() => new Set());
  const [openFeedbackIds, setOpenFeedbackIds] = useState(() => new Set());

  useEffect(() => {
    // Sequential polling loop that avoids overlapping/network pileups
    // and React 18 StrictMode double-mount effects
    let cancelled = false;
    let timeoutId = null;
    const inFlight = { current: false };

    const fetchSubmissions = async () => {
      if (cancelled || inFlight.current || !user?.id) return;
      inFlight.current = true;
      // Do not toggle global loading after first load to avoid flicker
      setError("");
      try {
        const response = await apiService.getUserSubmissions();
        const userSubs = (response.items || response.submissions || []).filter(
          sub => sub.user_id === user.id || sub.userId === user.id
        );
        setSubmissions(userSubs);
      } catch (err) {
        setError("Could not load submissions.");
      } finally {
        inFlight.current = false;
        if (!cancelled) {
          timeoutId = setTimeout(fetchSubmissions, 4000);
        }
      }
    };

    // Initial load with loading indicator
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      await fetchSubmissions();
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user]);

  if (loading) return <div className="card"><div className="card-body">Loading submissions...</div></div>;
  if (error) return <div className="card error"><div className="card-body">{error}</div></div>;
  if (!submissions.length) return <div className="card"><div className="card-body">No submissions found.</div></div>;

  return (
  <section className="card" aria-label="Your Submissions" style={{ minWidth: '320px', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: '0' }}>
      <div className="card-header" style={{ padding: '24px 24px 8px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Your Submissions</h2>
        <p className="muted" style={{ marginBottom: 8, fontSize: 15 }}>All your YantraBhashi code submissions and feedback</p>
      </div>
  <div className="card-body" style={{ padding: '16px 24px' }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {submissions.map(sub => {
            const sid = sub.id || sub._id;
            const isCodeOpen = openCodeIds.has(sid);
            const isFeedbackOpen = openFeedbackIds.has(sid);
            return (
            <li key={sid} style={{ marginBottom: "28px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
              {sub.title ? (
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{sub.title}</div>
              ) : null}
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }}><strong>Status:</strong> {sub.is_valid ? "Valid" : "Invalid"}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }}><strong>Submitted:</strong> {sub.submitted_at ? new Date(sub.submitted_at.$date || sub.submitted_at).toLocaleString() : (sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "-")}</div>
              <details open={isCodeOpen} onToggle={(e) => {
                const open = e.currentTarget.open;
                setOpenCodeIds(prev => {
                  const next = new Set(prev);
                  if (open) next.add(sid); else next.delete(sid);
                  return next;
                });
              }} style={{ marginTop: "10px" }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, padding: '4px 0', borderRadius: 6, transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = '#e0e7ff'} onMouseOut={e => e.target.style.background = 'none'}>Show Code</summary>
                <pre style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "14px", whiteSpace: 'pre-wrap', marginTop: 6 }}>{sub.code_text || sub.code}</pre>
              </details>
              {sub.instructor_feedback && sub.instructor_feedback.length > 0 ? (
                <details open={isFeedbackOpen} onToggle={(e) => {
                  const open = e.currentTarget.open;
                  setOpenFeedbackIds(prev => {
                    const next = new Set(prev);
                    if (open) next.add(sid); else next.delete(sid);
                    return next;
                  });
                }} style={{ marginTop: "10px" }}>
                  <summary style={{ cursor: 'pointer', fontSize: 14, padding: '4px 0', borderRadius: 6, transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = '#ecfdf5'} onMouseOut={e => e.target.style.background = 'none'}>Show Feedback</summary>
                  <div style={{ background: "#f0fdf4", border: '1px solid #bbf7d0', color: "#166534", padding: "10px", borderRadius: "8px", fontSize: 14, marginTop: 6 }}>{sub.instructor_feedback}</div>
                </details>
              ) : null}
            </li>
          );})}
        </ul>
      </div>
    </section>
  );
}
