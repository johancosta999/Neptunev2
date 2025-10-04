import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

function ClientWaterLevelDashboard() {
  const tankId = localStorage.getItem("tankId");
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("1w");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/waterlevel?tankId=${tankId}`);
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
    return data.filter((d) => new Date(d.recordedAt || d.timestamp) >= rangeTime);
  };
  const filteredRecords = filterByRange(records);

  // Calculate summary stats
  const latest = records.length > 0 ? records[records.length - 1] : null;
  const avgLevel = records.length > 0 ? (records.reduce((sum, r) => sum + (r.currentLevel || r.waterLevel || r.level || 0), 0) / records.length).toFixed(2) : '--';
  const refillCount = records.filter(r => (r.currentLevel || r.waterLevel || r.level || 0) >= 98).length;

  // UI styles
  const styles = {
    page: { padding: 24, background: "linear-gradient(120deg,#e0e7ff 0%,#f0fdfa 100%)", minHeight: "100vh" },
    header: { background: "#2563eb", color: "#fff", borderRadius: 18, padding: 24, marginBottom: 32, textAlign: 'center', boxShadow: "0 4px 24px #2563eb20" },
    summaryRow: { display: 'flex', gap: 32, justifyContent: 'center', margin: '24px 0', flexWrap: 'wrap' },
    summaryCard: { background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #2563eb20', padding: 24, minWidth: 180, textAlign: 'center' },
    summaryIcon: { fontSize: 32, marginBottom: 8 },
    card: { background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #6366f120', marginBottom: 24, padding: 0 },
    cardBody: { padding: 24 },
    controls: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
    select: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, background: '#e0e7ff' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, borderRadius: 12, overflow: 'hidden', marginTop: 12 },
    th: { textAlign: 'left', padding: '10px 12px', color: '#2563eb', fontWeight: 700, borderBottom: '2px solid #e0e7ff' },
    td: { padding: '10px 12px', borderBottom: '1px solid #e0e7ff', color: '#334155' },
    altRow: { background: '#f9fafb' },
    btnPrimary: { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginRight: 8 },
    btnSecondary: { padding: '10px 18px', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    infoBox: { background: '#e0e7ff', color: '#2563eb', borderRadius: 12, padding: 16, margin: '24px 0', textAlign: 'center', fontSize: 15 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Water Level Dashboard</h1>
        <div style={{ fontSize: 18, marginTop: 8 }}>Tank ID: {tankId}</div>
        <div style={{ marginTop: 12, fontSize: 16 }}>
          Latest Level: <span style={{ fontWeight: 700, color: latest ? (latest.currentLevel >= 80 ? '#10b981' : latest.currentLevel >= 40 ? '#f59e0b' : '#ef4444') : '#64748b' }}>{latest ? `${latest.currentLevel ?? latest.waterLevel ?? latest.level ?? '--'}%` : '--'}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{avgLevel}</div>
          <div style={{ color: '#64748b' }}>Avg. Level (%)</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🔄</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{refillCount}</div>
          <div style={{ color: '#64748b' }}>Refill Cycles</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⏰</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{latest ? new Date(latest.recordedAt || latest.timestamp).toLocaleString() : '--'}</div>
          <div style={{ color: '#64748b' }}>Last Update</div>
        </div>
      </div>

      {/* Chart card */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#2563eb', margin: 0 }}>Water Level Trends</h2>
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
                dataKey="recordedAt"
                tickFormatter={value => new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip labelFormatter={value => `Time: ${new Date(value).toLocaleString()}`} formatter={val => [`${val}%`, 'Water Level']} />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="currentLevel" stroke="#2563eb" strokeWidth={3} name="Water Level (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent records table */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Recent Water Level Records</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date/Time</th>
                <th style={styles.th}>Level (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.td} colSpan="2">Loading...</td></tr>
              ) : records.length > 0 ? (
                [...records].reverse().slice(0, 10).map((rec, idx) => (
                  <tr key={rec._id || idx} style={idx % 2 === 1 ? styles.altRow : {}}>
                    <td style={styles.td}>{new Date(rec.recordedAt || rec.timestamp).toLocaleString()}</td>
                    <td style={styles.td}>{rec.currentLevel ?? rec.waterLevel ?? rec.level ?? '--'}%</td>
                  </tr>
                ))
              ) : (
                <tr><td style={styles.td} colSpan="2">No data available.</td></tr>
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
        <div style={{ fontWeight: 700, marginBottom: 4 }}>What does water level mean?</div>
        <div>Water level is shown as a percentage of your tank's capacity. Refill cycles are counted when the tank is filled to 98% or more. For best performance, keep your tank above 40%.</div>
      </div>
    </div>
  );
}

export default ClientWaterLevelDashboard;
