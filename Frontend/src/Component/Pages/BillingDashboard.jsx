import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Nav from "../Nav/nav";
import { useParams } from "react-router-dom";

// 🔹 Summarize weekly water level with proper refill cycles (for on-page UI only)
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
    const units = (refillCycles * (capacity || 0)) / 1000;
    const price = units * 20; // Rs 20 / 1000L unit
    return { date, totalLevel: totalLevel.toFixed(2), averageLevel: (totalLevel / count).toFixed(2), refillCycles, price };
  });
};

const calculateMonthlyBill = (weeklySummary) => {
  if (!Array.isArray(weeklySummary)) return { total: 0, rows: [] };
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const rows = weeklySummary.filter((row) => {
    const d = new Date(row.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const total = rows.reduce((s, r) => s + r.price, 0);
  return { total, rows };
};

function BillingDashboard() {
  const { tankId } = useParams();
  const [tankDetails, setTankDetails] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [monthlyBill, setMonthlyBill] = useState({ total: 0, rows: [] });
  const [loading, setLoading] = useState(true);

  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6", minHeight: "100vh" },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      marginBottom: "16px",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    },
    title: { fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 },
    body: { padding: "16px 20px" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "14px" },
    theadTr: { backgroundColor: "#f9fafb" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" },
    td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#111827" },
    logo: { height: 50 },
    reportHeader: { textAlign: "center", marginBottom: 20 },
    actionsRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
    btnPrimary: { padding: "10px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
    badgeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "8px" },
    totalBadge: { padding: "10px 14px", backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: "10px", fontWeight: 700 },
  };

  useEffect(() => {
    const fetchTankDetails = async () => {
      try {
        // Adjust this endpoint to your actual tank details source if needed
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
        setMonthlyBill(calculateMonthlyBill(summary));
      } catch (err) {
        console.error("Error fetching water level data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSummarize();
  }, [tankId, tankDetails]);

  // ✅ Official server-rendered PDF (Puppeteer) — latest bill by tank
  const handleDownloadOfficialPDF = async () => {
    try {
      // Optional: you can pass ?capacityL=7000&ratePerUnit=20 to override auto-compute defaults
      const res = await fetch(`/api/reports/billing/tank/${tankId}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billing_${tankId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not download billing PDF. Check backend logs and that /api is mounted.");
    }
  };

  return (
    <div style={styles.page}>
      <Nav />

      {/* Report Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Billing Dashboard - {tankId}</h1>
          <div style={styles.actionsRow}>
            <button style={styles.btnPrimary} onClick={handleDownloadOfficialPDF}>
              Download Official PDF Bill
            </button>
          </div>
        </div>

        <div style={styles.body}>
          {/* Header in on-page view (visual; the real PDF is server-rendered) */}
          <div style={styles.reportHeader}>
            <img src="/Neptune.png" alt="Brand Logo" style={styles.logo} />
            <h2>Neptune Water Billing Report</h2>
            <p>Customer: {tankDetails?.customerName || "-"}</p>
            <p>Tank ID: {tankId}</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>

          {/* Billing Table (on-page summary view) */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadTr}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Tank Capacity (L)</th>
                  <th style={styles.th}>Price per Unit (Rs)</th>
                  <th style={styles.th}>Refill Cycles</th>
                  <th style={styles.th}>Price (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td style={styles.td} colSpan="5">Loading...</td></tr>
                ) : weeklySummary.length > 0 ? (
                  weeklySummary.map(({ date, refillCycles, price }, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{date}</td>
                      <td style={styles.td}>{tankDetails?.capacity ?? "N/A"}</td>
                      <td style={styles.td}>20</td>
                      <td style={styles.td}>{refillCycles}</td>
                      <td style={styles.td}>{price.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td style={styles.td} colSpan="5">No data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#6b7280" }}>
            <p>© 2025 Neptune Water Systems. All rights reserved.</p>
            <p>Contact: support@neptune.com | +94 123 456 789</p>
          </div>
        </div>
      </div>

      {/* Monthly Total Card */}
      <div style={styles.card}>
        <div style={styles.body}>
          <div style={styles.badgeRow}>
            <h2 style={{ margin: 0, color: "#111827" }}>Monthly Bill Total</h2>
            <div style={styles.totalBadge}>Rs {monthlyBill.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingDashboard;
