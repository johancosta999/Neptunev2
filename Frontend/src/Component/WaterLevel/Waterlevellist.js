import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WaterLevelChart from "../WaterLevel/WaterLevelChart";
import { Button } from "@mui/material";

function WaterLevelList() {
  const [records, setRecords] = useState([]);
  const { tankId } = useParams();
  const ComponentsRef = useRef();
  const [showTable, setShowTable] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
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
    controls: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
    input: { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#ffffff" },
    btnPrimary: { padding: "10px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", textTransform: "none" },
    btnSecondary: { padding: "10px 14px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", textTransform: "none" },
    btnDanger: { padding: "10px 14px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", textTransform: "none" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "14px" },
    theadTr: { backgroundColor: "#f9fafb" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" },
    td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#111827" },
    toolbarRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
    pagination: { display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end", marginTop: "12px" },
    pageBtn: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", cursor: "pointer", textTransform: "none" },
    pageBtnActive: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", backgroundColor: "#dbeafe", cursor: "pointer", fontWeight: 700, textTransform: "none" },
    empty: { textAlign: "center", padding: "32px", color: "#6b7280", backgroundColor: "#f9fafb", borderRadius: "10px", border: "1px dashed #e5e7eb" },
  };

  // Fetch records
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

  // Delete single record
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/waterlevel/${id}`);
        fetchData();
      } catch (err) {
        console.error("❌ Error deleting:", err);
      }
    }
  };

  // Delete all records
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

  // Download PDF
  const handleDownloadPDF = () => {
    const input = ComponentsRef.current;
    if (!input) return;
    html2canvas(input, { useCORS: true, scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("water-level-report.pdf");
    });
  };

  // Weekly summary with Recycle Counts
  const getWeeklySummary = () => {
    const grouped = {};
    records.forEach((rec) => {
      const date = new Date(rec.recordedAt).toLocaleDateString();
      const level = Number(rec.currentLevel) || 0;
      if (!grouped[date]) {
        grouped[date] = { total: 0, count: 0, recycleCount: 0 };
      }
      grouped[date].total += level;
      grouped[date].count += 1;
      if (level >= 98) grouped[date].recycleCount += 1; // count refills
    });

    return Object.entries(grouped).map(([date, values]) => {
      const avgLevel = (values.total / values.count).toFixed(2);
      return { date, avgLevel, recycleCount: values.recycleCount };
    });
  };

  // Time range filtering helper
  const isWithinRange = (dateStr) => {
    const t = new Date(dateStr).getTime();
    if (!t) return false;
    const startOk = startDateTime ? t >= new Date(startDateTime).getTime() : true;
    const endOk = endDateTime ? t <= new Date(endDateTime).getTime() : true;
    return startOk && endOk;
  };

  // Apply time range filter to summary and records
  const filteredSummary = getWeeklySummary().filter((row) => {
    // Convert row.date (local date string) to a comparable date range check
    const dayStart = new Date(row.date);
    const dayEnd = new Date(row.date);
    dayEnd.setHours(23, 59, 59, 999);
    const startOk = startDateTime ? dayEnd.getTime() >= new Date(startDateTime).getTime() : true;
    const endOk = endDateTime ? dayStart.getTime() <= new Date(endDateTime).getTime() : true;
    return startOk && endOk;
  });

  const filteredRecords = records.filter((rec) => isWithinRange(rec.recordedAt));

  // Reset to first page when filters change
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
          <h2 style={styles.title}>Water Level Overview - {tankId}</h2>
        </div>
        <div style={styles.body}>
          <WaterLevelChart records={records} />
        </div>
      </div>

      {/* Summary Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Weekly Summary</h2>
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
            <Button
              onClick={() => { setStartDateTime(""); setEndDateTime(""); }}
              variant="contained"
              size="small"
              style={{ ...styles.btnSecondary }}
              className="no-print"
            >
              Reset
            </Button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadTr}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Average Water Level (%)</th>
                  <th style={styles.th}>Refill Cycles</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((row, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{row.date}</td>
                    <td style={styles.td}>{row.avgLevel}%</td>
                    <td style={styles.td}>{row.recycleCount}</td>
                  </tr>
                ))}
                {filteredSummary.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={3}>No summary data for selected range.</td>
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
          <div style={styles.toolbarRow} className="no-print">
            <Button
              id="daily-stats"
              variant="contained"
              onClick={() => setShowTable((prev) => !prev)}
              style={{ ...styles.btnPrimary }}
            >
              {showTable ? "Hide Daily Records" : "View Daily Records"}
            </Button>

            <Button
              variant="contained"
              onClick={handleDeleteAll}
              disabled={deletingAll}
              style={{ ...styles.btnDanger, opacity: deletingAll ? 0.7 : 1 }}
              className="no-print"
            >
              {deletingAll ? "Deleting..." : "Delete All Records"}
            </Button>

            <Button
              component={Link}
              to={`/water-level/add/${tankId}`}
              variant="contained"
              style={{ ...styles.btnSecondary }}
              className="no-print"
            >
              Add New Record
            </Button>

            <Button
              variant="contained"
              onClick={handleDownloadPDF}
              style={{ ...styles.btnSecondary }}
              className="no-print"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Table Card */}
      {showTable && (
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Water Level Records</h2>
          </div>
          <div style={styles.body} ref={ComponentsRef}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadTr}>
                    <th style={styles.th}>Tank ID</th>
                    <th style={styles.th}>Water Level (%)</th>
                    <th style={styles.th}>Recorded At</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((rec) => (
                    <tr key={rec._id}>
                      <td style={styles.td}>{rec.tankId}</td>
                      <td style={styles.td}>{rec.currentLevel}%</td>
                      <td style={styles.td}>
                        {rec.recordedAt ? new Date(rec.recordedAt).toLocaleString() : "-"}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Button
                            component={Link}
                            to={`/water-level/edit/${rec._id}`}
                            size="small"
                            variant="outlined"
                            style={{ ...styles.pageBtn }}
                            className="no-print"
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDelete(rec._id)}
                            style={{ ...styles.pageBtn }}
                            className="no-print"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td style={styles.td} colSpan={4}>No records for selected range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination} className="no-print">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                size="small"
                variant="outlined"
                style={{ ...styles.pageBtn }}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const active = page === currentPage;
                return (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    size="small"
                    variant={active ? "contained" : "outlined"}
                    style={active ? { ...styles.pageBtnActive } : { ...styles.pageBtn }}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                size="small"
                variant="outlined"
                style={{ ...styles.pageBtn }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaterLevelList;
