import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

function ClientWaterQualityDashboard() {
  const tankId = localStorage.getItem("tankId");
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("1w");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/waterquality?tankId=${tankId}`);
        setRecords(res.data.data || []);
      } catch (err) {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [tankId]);

  // Filter records by selected range
  const filterByRange = (data) => {
    const now = new Date();
    let rangeTime;
    if (range === "1h") rangeTime = now - 60 * 60 * 1000;
    else if (range === "1d") rangeTime = now - 24 * 60 * 60 * 1000;
    else if (range === "1w") rangeTime = now - 7 * 24 * 60 * 60 * 1000;
    return data.filter((d) => new Date(d.timestamp) >= rangeTime);
  };
  const filteredRecords = filterByRange(records);

  // Calculate summary stats
  const latest = records.length > 0 ? records[records.length - 1] : null;
  const avgPh = records.length > 0 ? (records.reduce((sum, r) => sum + (r.phLevel || 0), 0) / records.length).toFixed(2) : '--';
  const avgTds = records.length > 0 ? (records.reduce((sum, r) => sum + (r.tds || 0), 0) / records.length).toFixed(2) : '--';

  // UI styles
  const styles = {
    page: { padding: 24, background: "linear-gradient(120deg,#f0fdfa 0%,#e0e7ff 100%)", minHeight: "100vh" },
    header: { background: "#06b6d4", color: "#fff", borderRadius: 18, padding: 24, marginBottom: 32, textAlign: 'center', boxShadow: "0 4px 24px #06b6d420" },
    summaryRow: { display: 'flex', gap: 32, justifyContent: 'center', margin: '24px 0', flexWrap: 'wrap' },
    summaryCard: { background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #06b6d420', padding: 24, minWidth: 180, textAlign: 'center' },
    summaryIcon: { fontSize: 32, marginBottom: 8 },
    card: { background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #6366f120', marginBottom: 24, padding: 0 },
    cardBody: { padding: 24 },
    controls: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
    select: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, background: '#f0fdfa' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, borderRadius: 12, overflow: 'hidden', marginTop: 12 },
    th: { textAlign: 'left', padding: '10px 12px', color: '#0e7490', fontWeight: 700, borderBottom: '2px solid #e0e7ff' },
    td: { padding: '10px 12px', borderBottom: '1px solid #e0e7ff', color: '#334155' },
    altRow: { background: '#f9fafb' },
    btnPrimary: { padding: '10px 18px', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginRight: 8 },
    btnSecondary: { padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    infoBox: { background: '#f0fdfa', color: '#0e7490', borderRadius: 12, padding: 16, margin: '24px 0', textAlign: 'center', fontSize: 15 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Water Quality Dashboard</h1>
        <div style={{ fontSize: 18, marginTop: 8 }}>Tank ID: {tankId}</div>
        <div style={{ marginTop: 12, fontSize: 16 }}>
          Latest Status: <span style={{ fontWeight: 700, color: latest?.status?.toLowerCase() === 'unsafe' ? '#ef4444' : '#10b981' }}>{latest?.status || '--'}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🧪</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{avgPh}</div>
          <div style={{ color: '#64748b' }}>Avg. pH</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💧</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{avgTds}</div>
          <div style={{ color: '#64748b' }}>Avg. TDS</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⏰</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{latest ? new Date(latest.timestamp).toLocaleString() : '--'}</div>
          <div style={{ color: '#64748b' }}>Last Update</div>
        </div>
      </div>

      {/* Chart card */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#06b6d4', margin: 0 }}>Water Quality Trends</h2>
            <div style={styles.controls}>
              <label htmlFor="range-select">Range</label>
              <select id="range-select" value={range} onChange={e => setRange(e.target.value)} style={styles.select}>
                <option value="1h">Last Hour</option>
                <option value="1d">Last Day</option>
                <option value="1w">Last Week</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={filteredRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={value => new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              />
              <YAxis yAxisId="left" domain={[0, 14]} tickCount={8} label={{ value: 'pH', angle: -90, position: 'insideLeft', fill: '#0ea5e9' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1000]} label={{ value: 'TDS', angle: 90, position: 'insideRight', fill: '#6366f1' }} />
              <Tooltip labelFormatter={value => `Time: ${new Date(value).toLocaleString()}`} />
              <Legend verticalAlign="top" />
              <Line yAxisId="left" type="monotone" dataKey="phLevel" stroke="#0ea5e9" strokeWidth={3} name="pH Level" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="tds" stroke="#6366f1" strokeWidth={3} name="TDS (mg/L)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent records table */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h2 style={{ color: '#06b6d4', marginBottom: 12 }}>Recent Water Quality Records</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date/Time</th>
                <th style={styles.th}>pH</th>
                <th style={styles.th}>TDS</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.td} colSpan="4">Loading...</td></tr>
              ) : records.length > 0 ? (
                [...records].reverse().slice(0, 10).map((rec, idx) => (
                  <tr key={rec._id || idx} style={idx % 2 === 1 ? styles.altRow : {}}>
                    <td style={styles.td}>{new Date(rec.timestamp).toLocaleString()}</td>
                    <td style={styles.td}>{rec.phLevel}</td>
                    <td style={styles.td}>{rec.tds}</td>
                    <td style={{ ...styles.td, color: rec.status?.toLowerCase() === 'unsafe' ? '#ef4444' : '#10b981', fontWeight: 700 }}>{rec.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td style={styles.td} colSpan="4">No data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Link to="/homepage" style={{ textDecoration: "none" }}>
          <button style={styles.btnSecondary}>Back to Home</button>
        </Link>
      </div>

      {/* Info/help box */}
      <div style={styles.infoBox}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>What do these values mean?</div>
        <div>pH should be between 6.5 and 8.5 for safe water. TDS (Total Dissolved Solids) below 500 mg/L is considered good. If status is "Unsafe", please take action or contact support.</div>
      </div>
    </div>
  );
}

export default ClientWaterQualityDashboard;
