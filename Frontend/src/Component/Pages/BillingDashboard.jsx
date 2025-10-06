import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Nav from "../Nav/nav";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* =========================
   Helpers
==========================*/

const getWeeklyWaterLevelSummary = (records, capacity) => {
  if (!Array.isArray(records)) return [];
  const grouped = {};
  records.forEach((rec) => {
    const ts = rec.recordedAt || rec.timestamp;
    const date = ts ? new Date(ts).toLocaleDateString() : "--";
    const level = parseFloat(rec.waterLevel ?? rec.level ?? rec.currentLevel ?? 0);
    if (!grouped[date]) grouped[date] = { totalLevel: 0, count: 0, refillCycles: 0 };
    grouped[date].totalLevel += level;
    grouped[date].count += 1;
    if (level >= 98) grouped[date].refillCycles += 1;
  });

  return Object.entries(grouped).map(([date, { totalLevel, count, refillCycles }]) => {
    const units = (refillCycles * (Number(capacity) || 0)) / 1000; // 1000L = 1 unit
    const price = units * 20; // Rs 20 per unit
    return {
      date,
      averageLevel: count ? (totalLevel / count).toFixed(2) : "0.00",
      refillCycles,
      price,
    };
  });
};

const calculateMonthlyBill = (summaryRows) => {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  const rows = (summaryRows || []).filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const total = rows.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
  return { total, rows };
};

const fmtMoney = (n) => `Rs ${Number(n || 0).toFixed(2)}`;

/* =========================
   Component
==========================*/

export default function BillingDashboard() {
  const { tankId } = useParams();
  const [tankDetails, setTankDetails] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [monthlyBill, setMonthlyBill] = useState({ total: 0, rows: [] });
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const ACCENT = {
    main: "#f97316",
    pill: "rgba(251,146,60,.12)",
    glow: "rgba(251,146,60,.25)",
    textOn: "#0f172a",
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      padding: "16px 16px 24px",
      backgroundImage: `
        radial-gradient(1000px 500px at 15% -10%, ${ACCENT.glow}, transparent 60%),
        radial-gradient(900px 460px at 115% 10%, rgba(234,88,12,.18), transparent 60%),
        linear-gradient(135deg, #0b1020 0%, #0d1519 35%, #101826 100%)
      `,
      overflowX: "hidden",
    },
    animWrap: { position: "relative", isolation: "isolate" },
    aura: {
      content: '""',
      position: "absolute",
      inset: -200,
      background:
        "radial-gradient(600px 300px at 20% -10%, rgba(56,189,248,.08), transparent 60%), radial-gradient(600px 300px at 120% -20%, rgba(99,102,241,.08), transparent 60%)",
      filter: "blur(10px)",
      zIndex: 0,
      animation: "floaty 24s ease-in-out infinite",
      pointerEvents: "none",
    },
    container: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" },

    card: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
    },
    header: {
      padding: "14px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      color: "#e5e7eb",
    },
    title: { margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: ".2px", color: "#f8fafc" },
    body: { padding: "16px" },

    chips: { display: "flex", gap: 8, flexWrap: "wrap" },
    chip: {
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: ACCENT.pill,
      color: "#fed7aa",
      border: `1px solid ${ACCENT.glow}`,
    },

    btnPrimary: {
      height: 40,
      padding: "0 14px",
      borderRadius: 10,
      border: "none",
      fontWeight: 900,
      color: ACCENT.textOn,
      background: `linear-gradient(135deg, ${ACCENT.main}, #fb923c)`,
      boxShadow: "0 12px 24px rgba(249,115,22,.28)",
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
      padding: "12px",
      borderBottom: "1px solid rgba(148,163,184,.25)",
      color: "#9aa3b2",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid rgba(148,163,184,.18)",
      color: "#f1f5f9",
    },
    tdRight: { textAlign: "right", padding: "12px", borderBottom: "1px solid rgba(148,163,184,.18)", color: "#f1f5f9" },

    footerNote: { marginTop: 18, textAlign: "center", fontSize: 12, color: "#9aa3b2" },

    totalRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      color: "#e5e7eb",
    },
    totalBadge: {
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(34,197,94,.25)",
      background: "rgba(34,197,94,.12)",
      color: "#bbf7d0",
      fontWeight: 900,
      minWidth: 140,
      textAlign: "center",
    },

    brand: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#cbd5e1" },
    brandImg: { height: 48, filter: "drop-shadow(0 6px 16px rgba(0,0,0,.35))" },
  };

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
        const summary = getWeeklyWaterLevelSummary(res.data?.data || [], capacity);
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

  return (
    <div style={styles.page}>
      {/* global reset to kill the white browser margin */}
      <style>{`
        /* Remove default white border (8px) and ensure full bleed */
        html, body, #root { height: 100%; width: 100%; }
        body { margin: 0 !important; background: transparent; }
        * { box-sizing: border-box; }

        @keyframes floaty {
          0% { transform: translateY(0px) }
          50% { transform: translateY(14px) }
          100% { transform: translateY(0px) }
        }
        @media print {
          nav, .no-print { display:none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin:0; }
        }
        tr:hover td { background: rgba(2,6,23,.35); transition: background .2s ease; }
      `}</style>

      <Nav />

      <div style={styles.animWrap}>
        <div style={styles.aura} />
        <div style={styles.container}>
          {/* Report Card */}
          <div style={styles.card}>
            <div style={styles.header}>
              <h1 style={styles.title}>Billing Dashboard — {tankId}</h1>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={styles.chips}>
                  {tankDetails?.capacity && <span style={styles.chip}>Capacity: {tankDetails.capacity} L</span>}
                  <span style={styles.chip}>Unit Price: {fmtMoney(20)}</span>
                  {tankDetails?.customerName && <span style={styles.chip}>Customer: {tankDetails.customerName}</span>}
                </div>
                <button className="no-print" aria-label="Download PDF Bill" onClick={handleGeneratePDF} style={styles.btnPrimary}>
                  Download PDF Bill
                </button>
              </div>
            </div>

            <div style={styles.body} ref={reportRef}>
              {/* Branding */}
              <div style={styles.brand}>
                <img src="/Neptune.png" alt="Neptune logo" style={styles.brandImg} />
                <div style={{ fontWeight: 900, fontSize: 18, color: "#e2e8f0" }}>Neptune Water Billing Report</div>
                <div>Tank ID: <strong>{tankId}</strong></div>
                <div style={{ opacity: .8 }}>Generated: {new Date().toLocaleString()}</div>
              </div>

              <div style={{ height: 12 }} />

              {/* Table */}
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadTr}>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Tank Capacity (L)</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Price / Unit</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Refill Cycles</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Price (Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td style={styles.td} colSpan="5">Loading…</td></tr>
                    ) : (weeklySummary?.length || 0) > 0 ? (
                      weeklySummary.map(({ date, refillCycles, price }, idx) => (
                        <tr key={idx}>
                          <td style={styles.td}>{date}</td>
                          <td style={styles.td}>{tankDetails?.capacity ?? "—"}</td>
                          <td style={styles.tdRight}>{fmtMoney(20)}</td>
                          <td style={styles.tdRight}>{refillCycles}</td>
                          <td style={styles.tdRight}>{fmtMoney(price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td style={styles.td} colSpan="5">No data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.footerNote}>
                <p>* 1 unit = 1000 liters. A refill cycle is counted when level ≥ 98%.</p>
                <p>© {new Date().getFullYear()} Neptune Water Systems • support@neptune.com • +94 123 456 789</p>
              </div>
            </div>
          </div>

          {/* Monthly Total */}
          <div style={styles.card}>
            <div style={{ ...styles.body, paddingTop: 18, paddingBottom: 18 }}>
              <div style={styles.totalRow}>
                <h2 style={{ margin: 0, fontWeight: 900, color: "#f8fafc" }}>Monthly Bill Total</h2>
                <div style={styles.totalBadge}>{fmtMoney(monthlyBill.total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
