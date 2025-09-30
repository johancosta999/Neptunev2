import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WaterQualityChart from "../WaterQuality/WaterQualityChart";
import "./WaterQualityList.css"
import { Button } from "@mui/material";

function WaterQualityList() {
  const [records, setRecords] = useState([]);
  const { tankId } = useParams();
  const reportRef = useRef(); // Ref for PDF report
  const [showTable, setShowTable] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 🎨 Professional UI styles
  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6", minHeight: "100vh" },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      marginBottom: "16px",
    },
    header: { padding: "16px 20px", borderBottom: "1px solid #e5e7eb" },
    title: { fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 },
    body: { padding: "16px 20px" },
    toolbarRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
    input: { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#ffffff" },
    btnPrimary: { padding: "10px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
    btnSecondary: { padding: "10px 14px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
    btnDanger: { padding: "10px 14px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "14px" },
    theadTr: { backgroundColor: "#f9fafb" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" },
    td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#111827" },
    pagination: { display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end", marginTop: "12px" },
    pageBtn: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", cursor: "pointer" },
    pageBtnActive: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", backgroundColor: "#dbeafe", cursor: "pointer", fontWeight: 700 },
    empty: { textAlign: "center", padding: "32px", color: "#6b7280", backgroundColor: "#f9fafb", borderRadius: "10px", border: "1px dashed #e5e7eb" },
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/waterquality?tankId=${tankId}`
      );
      setRecords(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/waterquality/${id}`);
        fetchData();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`WaterQuality_Report_Tank_${tankId}.pdf`);
  };

  const getWeeklySummary = () => {
    const grouped = {};
    records.forEach((rec) => {
      const date = new Date(rec.timestamp).toLocaleDateString();
      if (!grouped[date]) grouped[date] = { phTotal: 0, tdsTotal: 0, count: 0, statusCount: {} };
      grouped[date].phTotal += rec.phLevel;
      grouped[date].tdsTotal += rec.tds;
      grouped[date].count += 1;
      grouped[date].statusCount[rec.status] = (grouped[date].statusCount[rec.status] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, values]) => {
      const avgPH = (values.phTotal / values.count).toFixed(2);
      const avgTDS = (values.tdsTotal / values.count).toFixed(2);
      const frequentStatus = Object.entries(values.statusCount).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      return { date, avgPH, avgTDS, frequentStatus };
    });
  };

  // Time range filter helpers
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
    const startOk = startDateTime ? dayEnd.getTime() >= new Date(startDateTime).getTime() : true;
    const endOk = endDateTime ? dayStart.getTime() <= new Date(endDateTime).getTime() : true;
    return startOk && endOk;
  });

  const filteredRecords = records.filter((rec) => isWithinRange(rec.timestamp));

  // Reset page when filters or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDateTime, endDateTime, showTable, records.length]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageItems = filteredRecords.slice(startIdx, endIdx);

  return (
    <div style={styles.page}>
      <Nav />

      {/* Chart Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Water Quality Overview - {tankId}</h2>
        </div>
        <div style={styles.body}>
          <WaterQualityChart records={records} />
        </div>
      </div>

      {/* Summary Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Weekly Water Quality Summary</h2>
        </div>
        <div style={{ ...styles.body, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={styles.toolbarRow}>
            <span>Time range:</span>
            <input
              style={styles.input}
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              max={endDateTime || undefined}
            />
            <span>to</span>
            <input
              style={styles.input}
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              min={startDateTime || undefined}
              max={new Date().toISOString().slice(0, 16)}
            />
            <button style={styles.btnSecondary} onClick={() => { setStartDateTime(""); setEndDateTime(""); }}>Reset</button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadTr}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Average PH</th>
                  <th style={styles.th}>Average TDS</th>
                  <th style={styles.th}>Most Common Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((row, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{row.date}</td>
                    <td style={styles.td}>{row.avgPH}</td>
                    <td style={styles.td}>{row.avgTDS}</td>
                    <td style={styles.td}>{row.frequentStatus}</td>
                  </tr>
                ))}
                {filteredSummary.length === 0 && (
                  <tr>
                    <td colSpan={4} style={styles.td}>No summary data for selected range.</td>
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
            <button style={styles.btnPrimary} onClick={() => setShowTable((prev) => !prev)}>
              {showTable ? "Hide Water Quality Report" : "View Water Quality Report"}
            </button>
            <Link to="/water-quality/add">
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
            <h2 style={styles.title}>Water Quality Records</h2>
          </div>
          <div style={styles.body} ref={reportRef}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadTr}>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>PH Level</th>
                    <th style={styles.th}>TDS</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((rec) => (
                    <tr key={rec._id}>
                      <td style={styles.td}>{new Date(rec.timestamp).toLocaleString()}</td>
                      <td style={styles.td}>{rec.phLevel}</td>
                      <td style={styles.td}>{rec.tds}</td>
                      <td style={styles.td}>{rec.status}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                      <td colSpan={5} style={styles.td}>No records for selected range.</td>
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
  );
}

export default WaterQualityList;
