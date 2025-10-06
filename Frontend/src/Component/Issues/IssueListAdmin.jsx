// src/pages/Admin/IssueListAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/nav";

export default function IssueListAdmin() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { tankId } = useParams();

  const [techs, setTechs] = useState([]);
  const [tankCityById, setTankCityById] = useState({});

  // --------- Styles (inline, no external CSS) ----------
  const styles = {
    page: {
      position: "relative",
      minHeight: "100vh",
      padding: "0 0 32px 0",
      overflowX: "hidden",
      background:
        "radial-gradient(1200px 600px at -10% -10%, rgba(59,130,246,.15), transparent 60%), radial-gradient(900px 480px at 110% 10%, rgba(16,185,129,.12), transparent 60%), linear-gradient(135deg, #0b1020 0%, #0d1519 35%, #101826 100%)",
    },
    bg: {
      position: "fixed",
      inset: 0,
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    },
    blob: (size) => ({
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.45,
      animation: "nep-drift 16s ease-in-out infinite",
      willChange: "transform, opacity",
    }),
    blob1: {
      top: "-10%",
      left: "-6%",
      background:
        "radial-gradient(circle at 30% 30%, rgba(56,189,248,.55), rgba(56,189,248,.08))",
    },
    blob2: {
      bottom: "-8%",
      right: "-10%",
      animationDelay: "2s",
      background:
        "radial-gradient(circle at 70% 40%, rgba(99,102,241,.45), rgba(99,102,241,.08))",
    },
    container: {
      position: "relative",
      zIndex: 1,
      maxWidth: 1280,
      margin: "0 auto",
      padding: "0 16px",
      animation: "nep-fadeUp .35s ease-out",
    },

    // Cards
    card: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      margin: "16px 0",
    },
    header: {
      padding: "18px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    titleRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      color: "#f8fafc",
      fontWeight: 900,
    },
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    subtitle: { marginTop: 6, color: "#9aa3b2", fontSize: 13 },
    pillDot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 40%, #22d3ee, #0ea5e9)",
      boxShadow: "0 0 0 4px rgba(34,211,238,.08)",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid rgba(148,163,184,.35)",
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
      fontWeight: 800,
      cursor: "pointer",
    },
    body: { padding: "16px 20px" },

    empty: {
      textAlign: "center",
      padding: 32,
      color: "#9aa3b2",
      background: "rgba(2,6,23,.55)",
      borderRadius: 12,
      border: "1px dashed rgba(148,163,184,.25)",
    },

    // Issue card
    issue: {
      background: "rgba(2,6,23,.5)",
      border: "1px solid rgba(148,163,184,.2)",
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      color: "#e5e7eb",
    },
    issueHead: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    issueTitle: { margin: 0, fontWeight: 900, fontSize: 16 },
    statusChip: (bg, fg) => ({
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: bg,
      color: fg,
      border: `1px solid ${fg}20`,
    }),
    metaRow: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      color: "#9aa3b2",
      fontSize: 13,
    },
    actionsRow: { display: "flex", gap: 10, flexWrap: "wrap" },
    btnPrimary: {
      padding: "8px 12px",
      borderRadius: 10,
      border: "none",
      fontWeight: 900,
      color: "#0b1020",
      background:
        "linear-gradient(135deg, rgba(59,130,246,1), rgba(16,185,129,1))",
      boxShadow: "0 10px 24px rgba(59,130,246,.28)",
      cursor: "pointer",
    },
    select: {
      padding: "8px 10px",
      borderRadius: 10,
      border: "1px solid rgba(148,163,184,.35)",
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
    },
    assignedLabel: { color: "#93c5fd", fontWeight: 800, marginTop: 6 },

    thumbWrap: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
    thumb: {
      width: 120,
      height: 90,
      objectFit: "cover",
      borderRadius: 10,
      border: "1px solid rgba(148,163,184,.25)",
    },
  };

  // ---------- Global resets (fix white top line) ----------
  const GlobalStyle = () => (
    <style>{`
      html, body, #root { height: 100%; }
      body { margin: 0; background: #0b1020; }
      * { box-sizing: border-box; }
      @keyframes nep-drift {
        0% { transform: translate3d(0,0,0) scale(1); opacity:.45; }
        50% { transform: translate3d(20px,-30px,0) scale(1.08); opacity:.65; }
        100% { transform: translate3d(0,0,0) scale(1); opacity:.45; }
      }
      @keyframes nep-fadeUp {
        0% { opacity:0; transform: translateY(8px); }
        100% { opacity:1; transform: translateY(0); }
      }
      button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
        outline: 2px solid rgba(59,130,246,.75);
        outline-offset: 2px;
        border-radius: 8px;
      }
      /* Optional: hide scrollbar track for a cleaner panel */
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-thumb { background: rgba(148,163,184,.35); border-radius: 10px; }
      ::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  );

  // ---------- Data loading ----------
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `http://localhost:5000/api/issues/mine?tankId=${tankId}`
        );
        const sorted = (res.data || []).sort((a, b) => {
          const aAssigned = !!a.assignedTo;
          const bAssigned = !!b.assignedTo;
          if (aAssigned === bAssigned)
            return new Date(b.createdAt) - new Date(a.createdAt);
          return aAssigned - bAssigned; // unassigned first
        });
        setIssues(sorted);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (tankId) fetchIssues();
  }, [tankId]);

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/staffs");
        setTechs(res.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadTechs();
  }, []);

  // Fetch tank city for each involved tank once
  useEffect(() => {
    const fetchCities = async () => {
      const uniqueTankIds = Array.from(new Set(issues.map((i) => i.tankId)));
      const updates = {};
      await Promise.all(
        uniqueTankIds.map(async (id) => {
          if (tankCityById[id]) return; // already loaded
          try {
            const res = await axios.get(
              `http://localhost:5000/api/sellers/${id}`
            );
            if (res.data?.city) updates[id] = res.data.city;
          } catch (e) {
            /* ignore */
          }
        })
      );
      if (Object.keys(updates).length) {
        setTankCityById((prev) => ({ ...prev, ...updates }));
      }
    };
    if (issues.length) fetchCities();
  }, [issues, tankCityById]);

  // ---------- Actions ----------
  const assignTech = async (issueId, techId) => {
    try {
      await axios.patch(`http://localhost:5000/api/issues/${issueId}/assign`, {
        technicianId: techId,
      });

      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, assignedTo: techId } : i))
      );

      const tech = techs.find((t) => t._id === techId);
      const issue = issues.find((i) => i._id === issueId);

      if (issue?.tankId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/sellers/${issue.tankId}`
          );
          const tank = res.data;

          if (tank?.contactNumber) {
            const phoneNumber = tank.contactNumber.startsWith("+")
              ? tank.contactNumber
              : "+94" + tank.contactNumber;

            const message = `Hello ${tank.customerName || "Customer"}!
Your reported issue for Tank ID: ${issue.tankId} has been assigned to a technician.

👨‍🔧 Technician: ${tech?.name || "Technician"}
📍 Location: ${tech?.location || "N/A"}
⚡ Issue: ${issue.title}

They will contact you soon. Thank you!`;

            window.open(
              `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                message
              )}`,
              "_blank"
            );
          }
        } catch (err) {
          console.error("Failed to fetch tank details for WhatsApp:", err);
        }
      }

      alert("Technician assigned successfully!");
    } catch (err) {
      alert("Failed to assign technician.");
      console.error(err);
    }
  };

  const markSolved = async (issueId) => {
    try {
      await axios.patch(`http://localhost:5000/api/issues/${issueId}/resolve`);
      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, status: "Resolved" } : i))
      );

      const issue = issues.find((i) => i._id === issueId);

      if (issue?.tankId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/sellers/${issue.tankId}`
          );
          const tank = res.data;

          if (tank?.contactNumber) {
            const phoneNumber = tank.contactNumber.startsWith("+")
              ? tank.contactNumber
              : "+94" + tank.contactNumber;

            const message = `Hello ${tank.customerName || "Customer"}!
✅ Your reported issue for Tank ID: ${issue.tankId} has been marked as RESOLVED.

⚡ Issue: ${issue.title}
We hope everything is working perfectly now. Thank you for your patience! 🙏`;

            window.open(
              `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                message
              )}`,
              "_blank"
            );
          }
        } catch (err) {
          console.error("Failed to fetch tank details for WhatsApp:", err);
        }
      }

      alert("Issue marked as solved!");
    } catch (err) {
      alert("Failed to update issue status.");
      console.error(err);
    }
  };

  // ---------- UI ----------
  const statusStyle = (status) => {
    if (String(status).toLowerCase() === "resolved")
      return styles.statusChip("rgba(16,185,129,.12)", "#34d399");
    if (String(status).toLowerCase() === "open")
      return styles.statusChip("rgba(59,130,246,.12)", "#60a5fa");
    return styles.statusChip("rgba(234,179,8,.12)", "#fbbf24");
  };

  return (
    <div style={styles.page}>
      <GlobalStyle />

      {/* Floating background blobs */}
      <div style={styles.bg} aria-hidden="true">
        <div style={{ ...styles.blob(420), ...styles.blob1 }} />
        <div style={{ ...styles.blob(520), ...styles.blob2 }} />
      </div>

      <Nav />

      <div style={styles.container}>
        {/* Top header card */}
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.titleRow}>
              <span style={styles.pillDot} />
              <h2 style={styles.title}>All Reported Issues</h2>
            </div>
            <p style={styles.subtitle}>
              Track, assign, and resolve client issues. Unassigned items are shown
              first.
            </p>
            <button onClick={() => window.history.back()} style={styles.backBtn}>
              ← Back
            </button>
          </div>
        </div>

        {/* Issues list card */}
        <div style={styles.card}>
          <div style={styles.body}>
            {loading && <div style={styles.empty}>Loading issues...</div>}
            {error && <div style={styles.empty}>{error}</div>}

            {!loading && !error && issues.length === 0 && (
              <div style={styles.empty}>No issues reported yet.</div>
            )}

            {!loading &&
              !error &&
              issues.map((issue) => {
                const city = tankCityById[issue.tankId];
                return (
                  <div key={issue._id} style={styles.issue}>
                    <div style={styles.issueHead}>
                      <h3 style={styles.issueTitle}>{issue.title}</h3>
                      <span style={statusStyle(issue.status)}>
                        {issue.status}
                      </span>
                    </div>

                    <p style={{ marginTop: 8, color: "#cbd5e1" }}>
                      {issue.description}
                    </p>

                    <div style={{ marginTop: 10 }}>
                      <div style={styles.metaRow}>
                        <span>Tank: <strong>{issue.tankId}</strong></span>
                        <span>Category: <strong>{issue.category}</strong></span>
                        <span>Priority: <strong>{issue.priority}</strong></span>
                        <span>
                          Reported:{" "}
                          <strong>
                            {new Date(issue.createdAt).toLocaleString()}
                          </strong>
                        </span>
                        {city && <span>City: <strong>{city}</strong></span>}
                      </div>
                    </div>

                    {/* Attachments */}
                    {issue.attachments && issue.attachments.length > 0 && (
                      <div style={styles.thumbWrap}>
                        {issue.attachments.map((src, idx) => (
                          <img
                            key={idx}
                            src={`http://localhost:5000${src}`}
                            alt="attachment"
                            style={styles.thumb}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ marginTop: 12 }}>
                      <div style={styles.actionsRow}>
                        <button
                          style={styles.btnPrimary}
                          onClick={() => markSolved(issue._id)}
                        >
                          Mark as Solved
                        </button>

                        <div>
                          <label style={{ color: "#9aa3b2", marginRight: 8 }}>
                            Assign Technician:
                          </label>
                          <select
                            defaultValue={issue.assignedTo || ""}
                            onChange={(e) => assignTech(issue._id, e.target.value)}
                            style={styles.select}
                          >
                            <option value="">-- Select Technician --</option>
                            {techs
                              .filter((t) => {
                                const tCity = city;
                                if (!tCity) return true;
                                return (
                                  (t.location || "").toLowerCase() ===
                                  String(tCity).toLowerCase()
                                );
                              })
                              .map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name} {t.location ? `(${t.location})` : ""}
                                </option>
                              ))}
                          </select>
                          {issue.assignedTo && (
                            <p style={styles.assignedLabel}>
                              Assigned to:{" "}
                              {techs.find((t) => t._id === issue.assignedTo)?.name ||
                                "Unknown"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
