// src/pages/WaterQuality/WaterQualityList.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WaterQualityChart from "../WaterQuality/WaterQualityChart";
import { Button } from "@mui/material";

function WaterQualityList() {
  const [records, setRecords] = useState([]);
  const { tankId } = useParams();
  const reportRef = useRef();
  const [showTable, setShowTable] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [generatingSummaryPDF, setGeneratingSummaryPDF] = useState(false);

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
        `http://localhost:5000/api/waterquality?tankId=${tankId}`
      );
      // Sort records by timestamp descending (newest first) when fetching
      const sortedRecords = (res.data.data || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setRecords(sortedRecords);
    } catch (err) {
      console.error(err);
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
      await axios.delete(`http://localhost:5000/api/waterquality/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL water quality records for tank ${tankId}? This action cannot be undone!`)) return;
    
    try {
      // Get all records for this tank
      const tankRecords = records.filter(rec => rec.tankId === tankId);
      
      if (tankRecords.length === 0) {
        alert("No records found to delete.");
        return;
      }

      // Delete all records one by one (or you could create a bulk delete endpoint)
      for (const record of tankRecords) {
        await axios.delete(`http://localhost:5000/api/waterquality/${record._id}`);
      }
      
      alert(`Successfully deleted ${tankRecords.length} water quality records.`);
      fetchData();
    } catch (err) {
      console.error("Error deleting all records:", err);
      alert("Error deleting records. Please try again.");
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
    pdf.save(`WaterQuality_Report_Tank_${tankId}.pdf`);
  };

  const handleGenerateSummaryPDF = async () => {
    setGeneratingSummaryPDF(true);
    
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px 40px;
          margin-bottom: 0;
          border-radius: 0;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 1px;">NEPTUNE</h1>
              <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: 300; opacity: 0.9;">Water Quality Management System</h2>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; opacity: 0.9;">Weekly Summary Report</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
        
        <div style="
          background: #f8fafc;
          padding: 25px 40px;
          border-bottom: 3px solid #3b82f6;
          margin-bottom: 30px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Weekly Water Quality Summary</h3>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Tank ID: ${tankId} | Daily averages and status overview</p>
            </div>
            <div style="text-align: right;">
              <div style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 16px;">
                ${filteredSummary.length} Days
              </div>
            </div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(header);

      // Create summary table
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
        font-size: 13px;
        color: #1e293b;
        margin: 0;
      `;

      // Create table header
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr style="background: linear-gradient(135deg, #1e293b, #334155);">
          <th style="padding: 16px 12px; color: #ffffff; font-weight: 700; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Date</th>
          <th style="padding: 16px 12px; color: #ffffff; font-weight: 700; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Avg pH</th>
          <th style="padding: 16px 12px; color: #ffffff; font-weight: 700; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Avg TDS (mg/L)</th>
          <th style="padding: 16px 12px; color: #ffffff; font-weight: 700; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Avg Turbidity (NTU)</th>
          <th style="padding: 16px 12px; color: #ffffff; font-weight: 700; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Most Common Status</th>
        </tr>
      `;
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');
      filteredSummary.forEach((row, index) => {
        const isEven = index % 2 === 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 13px; font-weight: 600;">${row.date}</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 13px; text-align: center;">${row.avgPH}</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 13px; text-align: center;">${row.avgTDS}</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 13px; text-align: center;">${row.avgTurbidity}</td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e2e8f0; background-color: ${isEven ? '#ffffff' : '#f8fafc'}; color: #1e293b; font-size: 13px; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background: ${row.frequentStatus === 'Safe' ? '#d1fae5' : '#fef3c7'}; color: ${row.frequentStatus === 'Safe' ? '#065f46' : '#92400e'}; border: 1px solid ${row.frequentStatus === 'Safe' ? '#10b981' : '#f59e0b'};">
              ${row.frequentStatus}
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Add empty state if no data
      if (filteredSummary.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td colspan="5" style="padding: 32px; text-align: center; color: #64748b; font-style: italic; background: #f8fafc;">
            No summary data available for the selected date range.
          </td>
        `;
        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      pdfContainer.appendChild(tableWrapper);

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
          <div style="margin-bottom: 8px; font-weight: 600;">Neptune Water Quality Management System</div>
          <div style="opacity: 0.8;">Generated on ${new Date().toLocaleString()} | Tank ID: ${tankId} | Confidential Document</div>
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
      const fileName = `Neptune_Weekly_Summary_Tank_${tankId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating summary PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGeneratingSummaryPDF(false);
    }
  };

  // ---------- Summary helpers ----------
  const getWeeklySummary = () => {
    const grouped = {};
    records.forEach((rec) => {
      const date = new Date(rec.timestamp).toLocaleDateString();
      if (!grouped[date])
        grouped[date] = { 
          phTotal: 0, 
          tdsTotal: 0, 
          turbidityTotal: 0, 
          count: 0, 
          statusCount: {} 
        };
      grouped[date].phTotal += rec.phLevel;
      grouped[date].tdsTotal += rec.tds;
      grouped[date].turbidityTotal += rec.turbidity || 0;
      grouped[date].count += 1;
      grouped[date].statusCount[rec.status] =
        (grouped[date].statusCount[rec.status] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, values]) => {
      const avgPH = (values.phTotal / values.count).toFixed(2);
      const avgTDS = (values.tdsTotal / values.count).toFixed(2);
      const avgTurbidity = (values.turbidityTotal / values.count).toFixed(2);
      const frequentStatus = Object.entries(values.statusCount).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      return { date, avgPH, avgTDS, avgTurbidity, frequentStatus };
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

  // Latest first - sort by timestamp descending (newest first)
  const filteredRecords = records
    .filter((rec) => isWithinRange(rec.timestamp))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
            <h2 style={styles.title}>Water Quality Overview — {tankId}</h2>
          </div>
          <div style={styles.body}>
            {/* Your chart component (can ignore the prop if not used) */}
            <WaterQualityChart records={records} />
          </div>
        </div>

        {/* Summary Card */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Weekly Water Quality Summary</h2>
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
                    <th style={styles.th}>Avg pH</th>
                    <th style={styles.th}>Avg TDS</th>
                    <th style={styles.th}>Avg Turbidity</th>
                    <th style={styles.th}>Most Common Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((row, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{row.date}</td>
                      <td style={styles.td}>{row.avgPH}</td>
                      <td style={styles.td}>{row.avgTDS}</td>
                      <td style={styles.td}>{row.avgTurbidity} NTU</td>
                      <td style={styles.td}>{row.frequentStatus}</td>
                    </tr>
                  ))}
                  {filteredSummary.length === 0 && (
                    <tr>
                      <td colSpan={5} style={styles.td}>
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
                {showTable ? "Hide Water Quality Report" : "View Water Quality Report"}
              </button>

              <Link to={`/water-quality/add/${tankId}`}>
                <button style={styles.btnSecondary}>Add New Record</button>
              </Link>

              

              <button 
                onClick={handleGenerateSummaryPDF} 
                disabled={generatingSummaryPDF || filteredSummary.length === 0}
                style={{
                  ...styles.btnSecondary,
                  background: generatingSummaryPDF || filteredSummary.length === 0 
                    ? "rgba(148,163,184,.1)" 
                    : "rgba(59,130,246,.1)",
                  border: generatingSummaryPDF || filteredSummary.length === 0 
                    ? "1px solid rgba(148,163,184,.3)" 
                    : "1px solid rgba(59,130,246,.3)",
                  color: generatingSummaryPDF || filteredSummary.length === 0 
                    ? "#9aa3b2" 
                    : "#3b82f6",
                  opacity: generatingSummaryPDF || filteredSummary.length === 0 ? 0.7 : 1
                }}
              >
                {generatingSummaryPDF ? "Generating..." : "📊 Download Weekly Summary"}
              </button>

              <button 
                onClick={handleDeleteAll} 
                style={{
                  ...styles.btnSecondary,
                  background: "rgba(239,68,68,.1)",
                  border: "1px solid rgba(239,68,68,.3)",
                  color: "#ef4444"
                }}
              >
                🗑️ Delete All Records
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Table Card */}
        {showTable && (
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>Water Quality Records</h2>
            </div>
            <div style={styles.body} ref={reportRef}>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadTr}>
                      <th style={styles.th}>Timestamp</th>
                      <th style={styles.th}>pH Level</th>
                      <th style={styles.th}>TDS</th>
                      <th style={styles.th}>Turbidity</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((rec) => (
                      <tr key={rec._id}>
                        <td style={styles.td}>
                          {new Date(rec.timestamp).toLocaleString()}
                        </td>
                        <td style={styles.td}>{rec.phLevel}</td>
                        <td style={styles.td}>{rec.tds}</td>
                        <td style={styles.td}>{rec.turbidity || 'N/A'} NTU</td>
                        <td style={styles.td}>{rec.status}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              component={Link}
                              to={`/water-quality/edit/${rec._id}`}
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
                        <td colSpan={6} style={styles.td}>
                          No records for selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ ...styles.pagination, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#9aa3b2', fontSize: '14px' }}>
                  Page {currentPage} of {totalPages} ({filteredRecords.length} records)
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  style={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                
                {/* Smart pagination with ellipsis */}
                {(() => {
                  const maxVisiblePages = 5;
                  const pages = [];
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <button
                          key={i}
                          style={i === currentPage ? styles.pageBtnActive : styles.pageBtn}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // Show smart pagination with ellipsis
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    // Always show first page
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          style={styles.pageBtn}
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" style={{ padding: "0 8px", color: "#9aa3b2" }}>
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Show middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          style={i === currentPage ? styles.pageBtnActive : styles.pageBtn}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Always show last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" style={{ padding: "0 8px", color: "#9aa3b2" }}>
                            ...
                          </span>
                        );
                      }
                      pages.push(
                    <button
                          key={totalPages}
                          style={styles.pageBtn}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                    </button>
                  );
                    }
                  }
                  
                  return pages;
                })()}
                
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
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterQualityList;
