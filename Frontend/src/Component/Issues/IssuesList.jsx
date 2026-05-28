// src/pages/Issues/IssueList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export default function IssueList() {
  const { tankId } = useParams(); // get tankId from URL
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Water-themed styles matching client pages
  const styles = {
    page: {
      position: "relative",
      minHeight: "100vh",
      padding: "20px",
      color: "#e6f3ff",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    header: {
      background: "linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.22))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: "18px",
      padding: "28px 22px",
      marginBottom: "24px",
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      backdropFilter: "blur(8px)",
      textAlign: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: 900,
      margin: "0 0 8px 0",
      color: "#e6f3ff",
      textShadow: "0 10px 30px rgba(0,0,0,.45)",
    },
    subtitle: {
      fontSize: "16px",
      color: "#9ddcff",
      margin: "0 0 16px 0",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "12px",
      border: "1px solid rgba(148,163,184,.35)",
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
      fontWeight: 800,
      cursor: "pointer",
      textDecoration: "none",
      transition: "all 0.2s ease",
    },
    message: {
      textAlign: "center",
      color: "#9ddcff",
      padding: "40px 20px",
      fontSize: "18px",
      background: "rgba(15,23,42,.5)",
      borderRadius: "16px",
      border: "1px solid rgba(148,163,184,.2)",
      margin: "20px 0",
    },
    error: {
      background: "rgba(239,68,68,.15)",
      color: "#fca5a5",
      padding: "16px 20px",
      borderRadius: "12px",
      textAlign: "center",
      margin: "20px 0",
      border: "1px solid rgba(239,68,68,.3)",
    },
    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    card: {
      background: "linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.66))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#e6f3ff",
      margin: 0,
    },
    status: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    statusOpen: {
      background: "rgba(245,158,11,.15)",
      color: "#fbbf24",
      border: "1px solid rgba(245,158,11,.3)",
    },
    statusResolved: {
      background: "rgba(16,185,129,.15)",
      color: "#34d399",
      border: "1px solid rgba(16,185,129,.3)",
    },
    statusClosed: {
      background: "rgba(148,163,184,.15)",
      color: "#cbd5e1",
      border: "1px solid rgba(148,163,184,.3)",
    },
    cardDesc: {
      color: "#cbd5e1",
      marginBottom: "16px",
      lineHeight: "1.6",
    },
    cardMeta: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      color: "#9ddcff",
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "8px",
    },
    cardDate: {
      fontSize: "13px",
      color: "#94a3b8",
    },
    attachments: {
      marginTop: "16px",
    },
    attachmentImg: {
      width: "120px",
      height: "90px",
      objectFit: "cover",
      borderRadius: "8px",
      border: "1px solid rgba(148,163,184,.25)",
      marginRight: "8px",
      marginBottom: "8px",
    },
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `http://localhost:5000/api/issues/mine?tankId=${tankId}`
        );
        // hide resolved issues from user view
        setIssues((res.data || []).filter(i => i.status !== "Resolved"));
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [tankId]);

  return (
    <div className="issue-list-page" style={styles.page}>
      {/* Aurora background CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');
        .issue-list-page{
          background:
            radial-gradient(1200px 600px at -15% -10%, rgba(34,211,238,.16), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(96,165,250,.14), transparent 55%),
            linear-gradient(135deg,#0a0f1e 0%,#0a1726 45%,#0b1d31 100%);
          overflow-x: hidden;
          isolation: isolate;
        }
        .issue-list-page::before,.issue-list-page::after{
          content:"";position:fixed;inset:-20vmax;z-index:-1;
          background:
            radial-gradient(32vmax 32vmax at 20% 20%, rgba(34,211,238,.12), transparent 60%),
            radial-gradient(28vmax 28vmax at 80% 10%, rgba(96,165,250,.12), transparent 60%),
            radial-gradient(26vmax 26vmax at 60% 80%, rgba(59,130,246,.10), transparent 60%);
          filter:blur(48px) saturate(120%);
          animation:aurora 30s linear infinite;
          opacity:.9;
        }
        .issue-list-page::after{animation-duration:40s;animation-direction:reverse;opacity:.6}
        @keyframes aurora{
          0%{transform:translate3d(0,0,0) rotate(0)}
          50%{transform:translate3d(2%,-1%,0) rotate(180deg)}
          100%{transform:translate3d(0,0,0) rotate(360deg)}
        }
        .issue-card:hover{
          transform:translateY(-3px);
          box-shadow:0 24px 68px rgba(34,211,238,.16);
          border-color:rgba(148,163,184,.35);
        }
        .back-btn:hover{
          transform:translateY(-1.5px);
          background:rgba(2,6,23,.8);
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Reported Issues</h1>
          <p style={styles.subtitle}>Tank ID: {tankId}</p>
          <Link to="/homepage" style={styles.backBtn} className="back-btn">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Loading State */}
        {loading && <div style={styles.message}>Loading issues...</div>}
        
        {/* Error State */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Empty State */}
        {!loading && !error && issues.length === 0 && (
          <div style={styles.message}>No issues reported yet for this tank.</div>
        )}

        {/* Issues Grid */}
        {!loading && !error && issues.length > 0 && (
          <div style={styles.cards}>
            {issues.map((issue) => (
              <div key={issue._id} style={styles.card} className="issue-card">
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{issue.title}</h3>
                  <span
                    style={{
                      ...styles.status,
                      ...(issue.status === "Open"
                        ? styles.statusOpen
                        : issue.status === "Resolved"
                        ? styles.statusResolved
                        : styles.statusClosed)
                    }}
                  >
                    {issue.status}
                  </span>
                </div>
                
                <p style={styles.cardDesc}>{issue.description}</p>
                
                <div style={styles.cardMeta}>
                  <span>Category: <strong>{issue.category}</strong></span>
                  <span>Priority: <strong>{issue.priority}</strong></span>
                </div>
                
                <p style={styles.cardDate}>
                  Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                </p>
                
                {issue.attachments && issue.attachments.length > 0 && (
                  <div style={styles.attachments}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {issue.attachments.map((src, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000${src}`}
                          alt="attachment"
                          style={styles.attachmentImg}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
