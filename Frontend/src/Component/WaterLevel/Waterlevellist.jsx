import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WaterLevelChart from "./WaterLevelChart";
import { Button } from "@mui/material";

function WaterLevelList() {
  const [records, setRecords] = useState([]);
  const { tankId } = useParams();
  const reportRef = useRef();
  const [showTable, setShowTable] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ---------- Inline styles (no external CSS) ----------
  const styles = {
    page: {
      position: "relative",
      minHeight: "100vh",
      padding: "0 0 32px 0",
      overflowX: "hidden",
      background:
        "radial-gradient(1200px 600px at -10% -10%, rgba(59,130,246,.15), transparent 60%), radial-gradient(900px 480px at 110% 10%, rgba(16,185,129,.12), transparent 60%), linear-gradient(135deg, #0b1020 0%, #0d1519 35%, #101826 100%)",
    },

    // Blob layer container
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
      animation: "wq-drift 16s ease-in-out infinite",
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
      animation: "wq-fadeUp .4s ease-out",
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
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    title: { fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 },
    body: { padding: "16px 20px" },

    // Controls + table
    toolbarRow: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    },
    input: {
      padding: "10px 12px",
      border: "1px solid rgba(148,163,184,.25)",
      borderRadius: 10,
      background: "rgba(3,7,18,.5)",
      color: "#f8fafc",
      outline: "none",
    },
    btnPrimary: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "none",
      fontWeight: 900,
      color: "#0b1020",
      background:
        "linear-gradient(135deg, rgba(59,130,246,1), rgba(16,185,129,1))",
      boxShadow: "0 10px 24px rgba(59,130,246,.28)",
      cursor: "pointer",
    },
    btnSecondary: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid rgba(148,163,184,.35)",
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
      fontWeight: 800,
      cursor: "pointer",
    },
    btnDanger: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid rgba(239,68,68,.35)",
      background: "rgba(239,68,68,.1)",
      color: "#fca5a5",
      fontWeight: 800,
      cursor: "pointer",
    },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: 14,
      color: "#e5e7eb",
    },
    theadTr: { background: "rgba(2,6,23,.6)" },
    th: {
      textAlign: "left",
      padding: 12,
      borderBottom: "1px solid rgba(148,163,184,.25)",
      color: "#9aa3b2",
      fontWeight: 800,
    },
    td: {
      padding: 12,
      borderBottom: "1px solid rgba(148,163,184,.18)",
      color: "#f8fafc",
    },
    pagination: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    pageBtn: {
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid rgba(148,163,184,.35)",
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
      cursor: "pointer",
    },
    pageBtnActive: {
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid rgba(59,130,246,.65)",
      background: "rgba(59,130,246,.18)",
      color: "#bfdbfe",
      fontWeight: 900,
      cursor: "pointer",
    },
    empty: {
      textAlign: "center",
      padding: 32,
      color: "#9aa3b2",
      background: "rgba(2,6,23,.55)",
      borderRadius: 12,
      border: "1px dashed rgba(148,163,184,.25)",
    },
  };

  // ---------- Data ----------
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/waterlevel?tankId=${tankId}`
      );
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching water level:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [tankId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/waterlevel/${id}`);
      fetchData();
    } catch (err) {
      console.error("❌ Error deleting:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!tankId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL water level records for ${tankId}?`
    );
    if (!confirmed) return;

    try {
      setDeletingAll(true);
      await axios.delete(
        `http://localhost:5000/api/waterlevel/by-tank/${tankId}`
      );
      await fetchData();
      alert("All records deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting all:", err);
      alert("Failed to delete all records.");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`WaterLevel_Report_Tank_${tankId}.pdf`);
  };

  // ---------- Summary helpers ----------
  const getWeeklySummary = () => {
    const grouped = {};
    records.forEach((rec) => {
      const date = new Date(rec.recordedAt || rec.timestamp).toLocaleDateString();
      const level = Number(rec.currentLevel) || 0;
      if (!grouped[date]) {
        grouped[date] = { total: 0, count: 0, recycleCount: 0, statusCount: {} };
      }
      grouped[date].total += level;
      grouped[date].count += 1;
      if (level >= 98) grouped[date].recycleCount += 1; // count refills
      grouped[date].statusCount[rec.status] =
        (grouped[date].statusCount[rec.status] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, values]) => {
      const avgLevel = (values.total / values.count).toFixed(2);
      const frequentStatus = Object.entries(values.statusCount).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      return { date, avgLevel, recycleCount: values.recycleCount, frequentStatus };
    });
  };

  // Date range filtering
  const isWithinRange = (dateStr) => {
    const t = new Date(dateStr).getTime();
    if (!t) return false;
    const startOk = startDateTime ? t >= new Date(startDateTime).getTime() : true;
    const endOk = endDateTime ? t <= new Date(endDateTime).getTime() : true;
    return startOk && endOk;
  };

  const filteredSummary = getWeeklySummary().filter((row) => {
    const dayStart = new Date(row.date);
    const dayEnd = new Date(row.date);
    dayEnd.setHours(23, 59, 59, 999);
    const startOk = startDateTime
      ? dayEnd.getTime() >= new Date(startDateTime).getTime()
      : true;
    const endOk = endDateTime
      ? dayStart.getTime() <= new Date(endDateTime).getTime()
      : true;
    return startOk && endOk;
  });

  // Latest first
  const filteredRecords = records.filter((rec) => isWithinRange(rec.recordedAt || rec.timestamp)).reverse();

  // Pagination
  useEffect(() => setCurrentPage(1), [startDateTime, endDateTime, showTable, records.length]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageItems = filteredRecords.slice(startIdx, endIdx);

  return (
    <div style={styles.page}>
      {/* Global resets to remove white edge & keep page flush */}
      <style>{`
        html, body, #root { height: 100%; }
        body { margin: 0; background: #0b1020; }
        * { box-sizing: border-box; }

        @keyframes wq-drift {
          0% { transform: translate3d(0,0,0) scale(1); opacity:.45; }
          50% { transform: translate3d(20px,-30px,0) scale(1.08); opacity:.65; }
          100% { transform: translate3d(0,0,0) scale(1); opacity:.45; }
        }
        @keyframes wq-fadeUp {
          0% { opacity:0; transform: translateY(8px); }
          100% { opacity:1; transform: translateY(0); }
        }
        /* Hide the default chrome outline on focus for buttons/inputs, keep accessibility color */
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid rgba(59,130,246,.75);
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>

      {/* Floating background blobs */}
      <div style={styles.bg} aria-hidden="true">
        <div style={{ ...styles.blob(420), ...styles.blob1 }} />
        <div style={{ ...styles.blob(520), ...styles.blob2 }} />
      </div>

      <Nav />

      <div style={styles.container}>
        {/* Chart Card */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Water Level Overview — {tankId}</h2>
          </div>
          <div style={styles.body}>
            <WaterLevelChart records={records} />
          </div>
        </div>

        {/* Summary Card */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Weekly Water Level Summary</h2>
          </div>
          <div
            style={{
              ...styles.body,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={styles.toolbarRow}>
              <span style={{ color: "#9aa3b2", fontWeight: 700 }}>Time range:</span>
              <input
                style={styles.input}
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                max={endDateTime || undefined}
              />
              <span style={{ color: "#9aa3b2", fontWeight: 700 }}>to</span>
              <input
                style={styles.input}
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                min={startDateTime || undefined}
                max={new Date().toISOString().slice(0, 16)}
              />
              <button
                style={styles.btnSecondary}
                onClick={() => {
                  setStartDateTime("");
                  setEndDateTime("");
                }}
              >
                Reset
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadTr}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Average Water Level (%)</th>
                    <th style={styles.th}>Refill Cycles</th>
                    <th style={styles.th}>Most Common Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((row, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{row.date}</td>
                      <td style={styles.td}>{row.avgLevel}%</td>
                      <td style={styles.td}>{row.recycleCount}</td>
                      <td style={styles.td}>{row.frequentStatus}</td>
                    </tr>
                  ))}
                  {filteredSummary.length === 0 && (
                    <tr>
                      <td colSpan={4} style={styles.td}>
                        No summary data for selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div style={styles.card}>
          <div style={styles.body}>
            <div style={styles.toolbarRow}>
              <button
                style={styles.btnPrimary}
                onClick={() => setShowTable((prev) => !prev)}
              >
                {showTable ? "Hide Water Level Report" : "View Water Level Report"}
              </button>

              <button
                style={styles.btnDanger}
                onClick={handleDeleteAll}
                disabled={deletingAll}
              >
                {deletingAll ? "Deleting..." : "Delete All Records"}
              </button>

              <Link to={`/water-level/add/${tankId}`}>
                <button style={styles.btnSecondary}>Add New Record</button>
              </Link>

              <button onClick={handleGeneratePDF} style={styles.btnSecondary}>
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Table Card */}
        {showTable && (
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>Water Level Records</h2>
            </div>
            <div style={styles.body} ref={reportRef}>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadTr}>
                      <th style={styles.th}>Tank ID</th>
                      <th style={styles.th}>Water Level (%)</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Recorded At</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((rec) => (
                      <tr key={rec._id}>
                        <td style={styles.td}>{rec.tankId}</td>
                        <td style={styles.td}>{rec.currentLevel}%</td>
                        <td style={styles.td}>{rec.status}</td>
                        <td style={styles.td}>
                          {rec.recordedAt ? new Date(rec.recordedAt).toLocaleString() : "-"}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              component={Link}
                              to={`/water-level/edit/${rec._id}`}
                              size="small"
                              variant="outlined"
                              className="no-print"
                              style={{ ...styles.pageBtn }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleDelete(rec._id)}
                              className="no-print"
                              style={{ ...styles.pageBtn }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pageItems.length === 0 && (
                      <tr>
                        <td colSpan={5} style={styles.td}>
                          No records for selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const active = page === currentPage;
                  return (
                    <button
                      key={page}
                      style={active ? styles.pageBtnActive : styles.pageBtn}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  style={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterLevelList;
