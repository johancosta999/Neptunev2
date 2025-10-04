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

  // User-friendly, colorful styles
  const styles = {
    page: { padding: "24px", background: "linear-gradient(120deg,#e0e7ff 0%,#f0fdfa 100%)", minHeight: "100vh" },
    header: {
      background: "linear-gradient(90deg,#6366f1 0%,#06b6d4 100%)",
      color: "#fff",
      borderRadius: "18px",
      padding: "32px 24px 24px 24px",
      marginBottom: 32,
      boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    avatar: { fontSize: 48, marginBottom: 8 },
    tankId: { fontWeight: 700, fontSize: 20, letterSpacing: 1 },
    summaryRow: { display: "flex", gap: 32, justifyContent: "center", margin: "24px 0" },
    summaryCard: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #06b6d420", padding: 24, minWidth: 180, textAlign: "center" },
    summaryIcon: { fontSize: 32, marginBottom: 8 },
    card: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #6366f120", marginBottom: 24, padding: 0 },
    cardBody: { padding: 24 },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 15, borderRadius: 12, overflow: "hidden" },
    theadTr: { background: "#f0fdfa" },
    th: { textAlign: "left", padding: "14px 12px", color: "#0e7490", fontWeight: 700, borderBottom: "2px solid #e0e7ff" },
    td: { padding: "12px", borderBottom: "1px solid #e0e7ff", color: "#334155" },
    altRow: { background: "#f9fafb" },
    btnPrimary: { padding: "10px 18px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", marginRight: 8 },
    btnSecondary: { padding: "10px 18px", background: "#06b6d4", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
    progressBarWrap: { background: "#e0e7ff", borderRadius: 8, height: 16, margin: "18px 0" },
    progressBar: { background: "#6366f1", height: 16, borderRadius: 8 },
    infoBox: { background: "#f0fdfa", color: "#0e7490", borderRadius: 12, padding: 16, margin: "24px 0", textAlign: "center", fontSize: 15 },
  };

  return (
    <div style={styles.page}>
      {/* Colorful header */}
      <div style={styles.header}>
        <div style={styles.avatar}>💧</div>
        <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Your Billing Dashboard</h1>
        <div style={styles.tankId}>Tank ID: {tankId}</div>
        <div style={{ fontSize: 18, marginTop: 8 }}>{tankDetails?.customerName ? `Welcome, ${tankDetails.customerName}!` : ""}</div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🔄</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{weeklySummary.reduce((sum, row) => sum + row.refillCycles, 0)}</div>
          <div style={{ color: '#64748b' }}>Total Refills</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💸</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Rs {monthlyBill.total.toFixed(2)}</div>
          <div style={{ color: '#64748b' }}>This Month's Bill</div>
        </div>
      </div>


      {/* Last Month Bill Card */}
      <div style={{ maxWidth: 400, margin: '0 auto', marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #06b6d420', padding: 24, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 18, marginBottom: 6 }}>Last Month's Bill</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0e7490' }}>
            {(() => {
              // Calculate last month
              const now = new Date();
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const lastMonthRows = weeklySummary.filter(row => {
                const rowDate = new Date(row.date);
                return rowDate.getMonth() === lastMonth.getMonth() && rowDate.getFullYear() === lastMonth.getFullYear();
              });
              const lastMonthTotal = lastMonthRows.reduce((sum, row) => sum + row.price, 0);
              return lastMonthRows.length > 0 ? `Rs ${lastMonthTotal.toFixed(2)}` : '--';
            })()}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div style={styles.card}>
        <div style={styles.cardBody} ref={reportRef}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img src="/Neptune.png" alt="Brand Logo" style={{ height: 40, marginBottom: 8 }} />
            <h2 style={{ color: '#6366f1', margin: 0 }}>Billing Details</h2>
            <div style={{ color: '#64748b', fontSize: 15 }}>Track your water usage and refills</div>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
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
                    <tr key={idx} style={idx % 2 === 1 ? styles.altRow : {}}>
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
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <button style={styles.btnPrimary} onClick={handleGeneratePDF}>Download PDF Bill</button>
        <Link to="/homepage" style={{ textDecoration: "none" }}>
          <button style={styles.btnSecondary}>Back to Home</button>
        </Link>
      </div>

      {/* Info/help box */}
      <div style={styles.infoBox}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Need help understanding your bill?</div>
        <div>Each refill cycle is counted when your tank is filled to 98% or more. Your monthly bill is calculated at Rs 20 per 1000L per refill. For questions, contact support@neptune.com.</div>
      </div>
    </div>
  );
}

export default ClientBillingDashboard;
