// src/Component/Client/ClientBillingDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

// Utility functions (copied from admin BillingDashboard)
const getWeeklyWaterLevelSummary = (records, capacity) => {
  if (!Array.isArray(records)) return [];
  const grouped = {};
  records.forEach((rec) => {
    const date = new Date(rec.recordedAt || rec.timestamp).toLocaleDateString();
    const level = parseFloat(rec.waterLevel ?? rec.level ?? rec.currentLevel ?? 0);
    if (!grouped[date]) grouped[date] = { totalLevel: 0, count: 0, refillCycles: 0 };
    grouped[date].totalLevel += level;
    grouped[date].count += 1;
    if (level >= 98) grouped[date].refillCycles += 1;
  });
  return Object.entries(grouped).map(([date, { totalLevel, count, refillCycles }]) => {
    const units = (refillCycles * capacity) / 1000;
    const price = units * 20;
    return {
      date,
      totalLevel: totalLevel.toFixed(2),
      averageLevel: (totalLevel / count).toFixed(2),
      refillCycles,
      price
    };
  });
};

const calculateMonthlyBill = (weeklySummary) => {
  if (!Array.isArray(weeklySummary)) return { total: 0, rows: [] };
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthRows = weeklySummary.filter((row) => {
    const rowDate = new Date(row.date);
    return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
  });
  const total = thisMonthRows.reduce((sum, row) => sum + row.price, 0);
  return { total, rows: thisMonthRows };
};

function ClientBillingDashboard() {
  const tankId = localStorage.getItem("tankId");
  const [tankDetails, setTankDetails] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [monthlyBill, setMonthlyBill] = useState({ total: 0, rows: [] });
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    const fetchTankDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sellers/${tankId}`);
        setTankDetails(res.data);
      } catch (err) {
        console.error("Error fetching tank details:", err);
      }
    };
    fetchTankDetails();
  }, [tankId]);

  useEffect(() => {
    const fetchAndSummarize = async () => {
      if (!tankDetails) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/waterlevel?tankId=${tankId}`);
        const capacity = tankDetails?.capacity ?? 0;
        const summary = getWeeklyWaterLevelSummary(res.data.data || [], capacity);
        setWeeklySummary(summary);
        const monthly = calculateMonthlyBill(summary);
        setMonthlyBill(monthly);
      } catch (err) {
        console.error("Error fetching water level data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSummarize();
  }, [tankId, tankDetails]);

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Billing_Report_Tank_${tankId}.pdf`);
  };

  // Dark water theme + strong contrast table (no zebra)
  const styles = {
    page: {
      padding: "20px",
      minHeight: "100vh",
      position: "relative",
      color: "#e6f3ff",
    },
    header: {
      background: "linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.22))",
      border: "1px solid rgba(148,163,184,.18)",
      color: "#e6f3ff",
      borderRadius: "18px",
      padding: "28px 22px 20px",
      margin: "0 auto 22px",
      maxWidth: 1200,
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      backdropFilter: "blur(8px)",
    },
    avatar: { fontSize: 42, marginBottom: 8, filter: "drop-shadow(0 10px 22px rgba(34,211,238,.35))" },
    tankId: { fontWeight: 800, fontSize: 18, letterSpacing: .4 },
    summaryRow: {
      display: "flex",
      gap: 16,
      justifyContent: "center",
      flexWrap: "wrap",
      margin: "18px auto 10px",
      maxWidth: 1200,
    },
    summaryCard: {
      background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(15,23,42,.6))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 16,
      boxShadow: "0 18px 50px rgba(0,0,0,.35)",
      padding: 18,
      minWidth: 200,
      textAlign: "center",
      transition: "transform .25s, box-shadow .25s, border-color .25s",
    },
    summaryIcon: { fontSize: 28, marginBottom: 8, filter: "drop-shadow(0 0 14px rgba(34,211,238,.35))" },
    card: {
      background: "linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.66))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 16,
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      margin: "0 auto 18px",
      padding: 0,
      maxWidth: 1200,
      overflow: "hidden",
    },
    cardBody: { padding: 20 },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: 15,
      borderRadius: 12,
      overflow: "hidden",
      background: "transparent",
    },
    // header row tint kept subtle; the solid header color is applied via CSS below
    theadTr: { background: "rgba(34,211,238,.08)" },
    th: {
      textAlign: "left",
      padding: "14px 12px",
      color: "#eaf6ff",
      fontWeight: 800,
      borderBottom: "1px solid rgba(148,163,184,.25)",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid rgba(148,163,184,.22)",
      color: "#e6f3ff",
      background: "transparent",
    },
    btnPrimary: {
      padding: "12px 18px",
      background: "linear-gradient(135deg,#22d3ee,#60a5fa)",
      color: "#06222a",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 12,
      fontWeight: 900,
      cursor: "pointer",
      marginRight: 10,
      boxShadow: "0 18px 44px rgba(34,211,238,.25)",
      transition: "transform .2s",
    },
    btnSecondary: {
      padding: "12px 18px",
      background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
      color: "#e6f3ff",
      border: "1px solid rgba(148,163,184,.22)",
      borderRadius: 12,
      fontWeight: 900,
      cursor: "pointer",
      transition: "transform .2s",
    },
    infoBox: {
      background: "linear-gradient(180deg, rgba(34,197,94,.10), rgba(34,197,94,.06))",
      color: "#c8fde0",
      border: "1px solid rgba(34,197,94,.25)",
      borderRadius: 14,
      padding: 16,
      margin: "16px auto 0",
      textAlign: "center",
      fontSize: 14,
      maxWidth: 1200,
    },
  };

  return (
    <div className="billing-page" style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');
        .billing-page{
          background:
            radial-gradient(1200px 600px at -15% -10%, rgba(34,211,238,.16), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(96,165,250,.14), transparent 55%),
            linear-gradient(135deg,#0a0f1e 0%,#0a1726 45%,#0b1d31 100%);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          overflow-x: hidden;
          isolation:isolate;
        }
        .billing-page::before,.billing-page::after{
          content:"";position:fixed;inset:-20vmax;z-index:-1;
          background:
            radial-gradient(32vmax 32vmax at 20% 20%, rgba(34,211,238,.12), transparent 60%),
            radial-gradient(28vmax 28vmax at 80% 10%, rgba(96,165,250,.12), transparent 60%),
            radial-gradient(26vmax 26vmax at 60% 80%, rgba(59,130,246,.10), transparent 60%);
          filter:blur(48px) saturate(120%);
          animation:aurora 28s linear infinite;
          opacity:.9;
        }
        .billing-page::after{animation-duration:36s;animation-direction:reverse;opacity:.6}
        @keyframes aurora{
          0%{transform:translate3d(0,0,0) rotate(0)}
          50%{transform:translate3d(2%,-1%,0) rotate(180deg)}
          100%{transform:translate3d(0,0,0) rotate(360deg)}
        }
        .card-neo:hover{transform:translateY(-3px);box-shadow:0 24px 68px rgba(34,211,238,.16);border-color:rgba(148,163,184,.35)}
        .btn-press:hover{transform:translateY(-1.5px)}
        .brand-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.06);color:#9ddcff;font-weight:800}
        .title-glow{color:#e6f3ff;text-shadow:0 10px 30px rgba(0,0,0,.45)}
        .subtle{color:#a9c4e0}

        /* 🔥 Strong, readable table with NO zebra rows */
        .billing-table {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(3,7,18,.50);
          border: 1px solid rgba(148,163,184,.18);
        }
        .billing-table thead tr {
          background: linear-gradient(180deg,#2563eb,#1d4ed8);
        }
        .billing-table th {
          color: #eaf6ff !important;
          font-weight: 900;
          letter-spacing: .2px;
        }
        .billing-table tbody tr {
          background: rgba(2,6,23,.78); /* same background for every row (no zebra) */
        }
        .billing-table tbody tr + tr {
          border-top: 1px solid rgba(148,163,184,.22);
        }
        .billing-table td {
          color: #f1fbff !important;   /* brighter text */
        }
        .billing-table tbody tr:hover {
          background: rgba(2,6,23,.92);
        }
      `}</style>

      {/* Header */}
      <div className="card-neo" style={styles.header}>
        <div className="brand-chip" style={{ marginBottom: 8 }}>
          <span style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,.55))" }}>💧</span> Neptune Billing
        </div>
        <h1 className="title-glow" style={{ fontWeight: 900, fontSize: 28, margin: 0 }}>
          Your Billing Dashboard
        </h1>
        <div style={styles.tankId}>Tank ID: <span style={{ color: "#9ddcff" }}>{tankId}</span></div>
        <div className="subtle" style={{ fontSize: 16, marginTop: 6 }}>
          {tankDetails?.customerName ? `Welcome, ${tankDetails.customerName}!` : ""}
        </div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryRow}>
        <div className="card-neo" style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🔄</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            {weeklySummary.reduce((sum, row) => sum + row.refillCycles, 0)}
          </div>
          <div className="subtle">Total Refills</div>
        </div>
        <div className="card-neo" style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💸</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            Rs {monthlyBill.total.toFixed(2)}
          </div>
          <div className="subtle">This Month's Bill</div>
        </div>
      </div>

      {/* Last Month Bill Card */}
      <div style={{ maxWidth: 420, margin: "0 auto 18px" }}>
        <div className="card-neo" style={{
          background: "linear-gradient(180deg, rgba(15,23,42,.75), rgba(15,23,42,.6))",
          border: "1px solid rgba(148,163,184,.18)",
          borderRadius: 16,
          boxShadow: "0 18px 50px rgba(0,0,0,.35)",
          padding: 18,
          textAlign: "center",
        }}>
          <div style={{ fontWeight: 800, color: "#9ddcff", fontSize: 18, marginBottom: 4 }}>
            Last Month's Bill
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#22d3ee", textShadow: "0 0 14px rgba(34,211,238,.3)" }}>
            {(() => {
              const now = new Date();
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const lastMonthRows = weeklySummary.filter(row => {
                const rowDate = new Date(row.date);
                return rowDate.getMonth() === lastMonth.getMonth() && rowDate.getFullYear() === lastMonth.getFullYear();
              });
              const lastMonthTotal = lastMonthRows.reduce((sum, row) => sum + row.price, 0);
              return lastMonthRows.length > 0 ? `Rs ${lastMonthTotal.toFixed(2)}` : "--";
            })()}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card-neo" style={styles.card}>
        <div style={styles.cardBody} ref={reportRef}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <img src="/Neptune.png" alt="Brand Logo" style={{ height: 40, marginBottom: 6, filter: "drop-shadow(0 8px 18px rgba(34,211,238,.25))" }} />
            <h2 style={{ color: "#9ddcff", margin: 0, fontWeight: 900 }}>Billing Details</h2>
            <div className="subtle" style={{ fontSize: 14 }}>Track your water usage and refills</div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table} className="billing-table">
              <thead>
                <tr style={styles.theadTr}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Capacity (L)</th>
                  <th style={styles.th}>Refills</th>
                  <th style={styles.th}>Price (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td style={styles.td} colSpan="4">Loading...</td></tr>
                ) : weeklySummary.length > 0 ? (
                  weeklySummary.map(({ date, refillCycles, price }, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{date}</td>
                      <td style={styles.td}>{tankDetails?.capacity ?? "N/A"}</td>
                      <td style={styles.td}>{refillCycles}</td>
                      <td style={styles.td}>{price.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td style={styles.td} colSpan="4">No data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <button className="btn-press" style={styles.btnPrimary} onClick={handleGeneratePDF}>
          Download PDF Bill
        </button>
        <Link to="/homepage" style={{ textDecoration: "none" }}>
          <button className="btn-press" style={styles.btnSecondary}>
            Back to Home
          </button>
        </Link>
      </div>

      {/* Info/help box */}
      <div style={styles.infoBox}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>Need help understanding your bill?</div>
        <div>
          Each refill cycle is counted when your tank is filled to 98% or more. Your monthly bill is calculated at Rs 20 per 1000L per refill. For questions, contact <b>support@neptune.com</b>.
        </div>
      </div>
    </div>
  );
}

export default ClientBillingDashboard;
