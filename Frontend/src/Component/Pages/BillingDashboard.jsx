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
  const [generatingPDF, setGeneratingPDF] = useState(false);
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
    setGeneratingPDF(true);
    
    try {
      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.width = '1200px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.padding = '0';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.lineHeight = '1.4';
      
      // Create professional header with company branding
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          padding: 30px 40px;
          margin-bottom: 0;
          border-radius: 0;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 1px;">NEPTUNE</h1>
              <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: 300; opacity: 0.9;">Water Billing System</h2>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; opacity: 0.9;">Water Bill Invoice</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
        
        <div style="
          background: #fef7ed;
          padding: 25px 40px;
          border-bottom: 3px solid #f97316;
          margin-bottom: 30px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Water Bill Invoice</h3>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Tank ID: ${tankId} | Monthly Water Consumption & Billing Details</p>
            </div>
            <div style="text-align: right;">
              <div style="background: #f97316; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 16px;">
                ${fmtMoney(monthlyBill.total)}
              </div>
            </div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(header);

      // Create customer details section
      const customerSection = document.createElement('div');
      customerSection.innerHTML = `
        <div style="margin: 0 40px 30px 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 700;">Customer Information</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div>
              <strong style="color: #374151;">Customer Name:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.customerName || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #374151;">Tank ID:</strong><br>
              <span style="color: #1e293b;">${tankId}</span>
            </div>
            <div>
              <strong style="color: #374151;">Address:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.address || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #374151;">City:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.city || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #374151;">Contact:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.contactNumber || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #374151;">Email:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.customerEmail || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #374151;">Tank Capacity:</strong><br>
              <span style="color: #1e293b;">${tankDetails?.capacity || 'N/A'} Liters</span>
            </div>
            <div>
              <strong style="color: #374151;">Unit Price:</strong><br>
              <span style="color: #1e293b;">Rs 20.00 per 1000L</span>
            </div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(customerSection);

      // Create billing details table
      const tableWrapper = document.createElement('div');
      tableWrapper.style.cssText = `
        margin: 0 40px 40px 40px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
      `;

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        color: #1e293b;
        margin: 0;
      `;

      // Create table header
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr style="background: linear-gradient(135deg, #1e293b, #334155);">
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Date</th>
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Tank Capacity (L)</th>
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Refill Cycles</th>
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Units Consumed</th>
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Unit Price</th>
          <th style="padding: 12px 8px; color: #ffffff; font-weight: 700; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f97316;">Amount (Rs)</th>
        </tr>
      `;
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');
      if (weeklySummary && weeklySummary.length > 0) {
        weeklySummary.forEach((row, index) => {
          const isEven = index % 2 === 0;
          const unitsConsumed = ((row.refillCycles * (Number(tankDetails?.capacity) || 0)) / 1000).toFixed(2);
          
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; font-weight: 600;">${row.date}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; text-align: center;">${tankDetails?.capacity || 'N/A'}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; text-align: center;">${row.refillCycles}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; text-align: center;">${unitsConsumed}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; text-align: right;">Rs 20.00</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 12px; text-align: right; font-weight: 600;">${fmtMoney(row.price)}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td colspan="6" style="padding: 32px; text-align: center; color: #64748b; font-style: italic; background: #f8fafc;">
            No billing data available for the current period.
          </td>
        `;
        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      pdfContainer.appendChild(tableWrapper);

      // Add billing summary section
      const summarySection = document.createElement('div');
      summarySection.innerHTML = `
        <div style="margin: 0 40px 30px 40px; background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #0ea5e9;">
          <h4 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 16px; font-weight: 700;">Billing Summary</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div>
              <strong style="color: #0c4a6e;">Billing Period:</strong><br>
              <span style="color: #1e293b;">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div>
              <strong style="color: #0c4a6e;">Total Days:</strong><br>
              <span style="color: #1e293b;">${weeklySummary.length} days</span>
            </div>
            <div>
              <strong style="color: #0c4a6e;">Total Refill Cycles:</strong><br>
              <span style="color: #1e293b;">${weeklySummary.reduce((sum, row) => sum + row.refillCycles, 0)}</span>
            </div>
            <div>
              <strong style="color: #0c4a6e;">Total Units Consumed:</strong><br>
              <span style="color: #1e293b;">${weeklySummary.reduce((sum, row) => sum + ((row.refillCycles * (Number(tankDetails?.capacity) || 0)) / 1000), 0).toFixed(2)} units</span>
            </div>
            <div>
              <strong style="color: #0c4a6e;">Unit Price:</strong><br>
              <span style="color: #1e293b;">Rs 20.00 per 1000L</span>
            </div>
            <div>
              <strong style="color: #0c4a6e;">Total Amount:</strong><br>
              <span style="color: #1e293b; font-weight: 700; font-size: 16px;">${fmtMoney(monthlyBill.total)}</span>
            </div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(summarySection);

      // Add professional footer
      const footer = document.createElement('div');
      footer.innerHTML = `
        <div style="
          background: #1e293b;
          color: white;
          padding: 20px 40px;
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
        ">
          <div style="margin-bottom: 8px; font-weight: 600;">Neptune Water Billing System</div>
          <div style="opacity: 0.8;">Generated on ${new Date().toLocaleString()} | Tank ID: ${tankId} | Confidential Document</div>
          <div style="margin-top: 10px; opacity: 0.7; font-size: 11px;">
            * 1 unit = 1000 liters. A refill cycle is counted when water level ≥ 98%.<br>
            © ${new Date().getFullYear()} Neptune Water Systems • support@neptune.com • +94 123 456 789
          </div>
        </div>
      `;
      pdfContainer.appendChild(footer);

      document.body.appendChild(pdfContainer);

      // Generate PDF with higher quality
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: pdfContainer.scrollHeight,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Clean up
      document.body.removeChild(pdfContainer);

      // Download PDF with professional filename
      const fileName = `Neptune_Water_Bill_Tank_${tankId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
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
                <button 
                  className="no-print" 
                  aria-label="Download PDF Bill" 
                  onClick={handleGeneratePDF} 
                  disabled={generatingPDF}
                  style={{
                    ...styles.btnPrimary,
                    opacity: generatingPDF ? 0.7 : 1,
                    cursor: generatingPDF ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generatingPDF ? "Generating PDF..." : "📄 Download PDF Bill"}
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
