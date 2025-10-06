// src/Component/Client/ClientWaterQualityDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

function ClientWaterQualityDashboard() {
  const tankId = localStorage.getItem("tankId");
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("1w");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/waterquality?tankId=${tankId}`
        );
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

  // Filter records by selected range (hour/day/week)
  const filterByRange = (data) => {
    const now = new Date();
    let rangeTime;
    if (range === "1h") rangeTime = now - 60 * 60 * 1000;
    else if (range === "1d") rangeTime = now - 24 * 60 * 60 * 1000;
    else if (range === "1w") rangeTime = now - 7 * 24 * 60 * 60 * 1000;
    return data.filter((d) => new Date(d.timestamp) >= rangeTime);
  };
  const filteredRecords = filterByRange(records);

  // Summaries
  const latest = records.length > 0 ? records[records.length - 1] : null;
  const avgPh =
    records.length > 0
      ? (records.reduce((s, r) => s + (r.phLevel || 0), 0) / records.length).toFixed(2)
      : "--";
  const avgTds =
    records.length > 0
      ? (records.reduce((s, r) => s + (r.tds || 0), 0) / records.length).toFixed(2)
      : "--";

  const statusColor =
    latest?.status?.toLowerCase() === "unsafe" ? "#ef4444" : "#10b981";

  /* ------------------------------ STYLES ------------------------------ */
  const S = {
    page: { padding: 18, minHeight: "100vh", position: "relative", color: "#e6f3ff" },

    header: {
      background:
        "linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.22))",
      border: "1px solid rgba(148,163,184,.18)",
      color: "#e6f3ff",
      borderRadius: 18,
      padding: "22px 18px",
      margin: "0 auto 18px",
      maxWidth: 1200,
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      backdropFilter: "blur(8px)",
      textAlign: "center",
    },
    tag: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(148,163,184,.25)",
      background: "rgba(255,255,255,.06)",
      color: "#9ddcff",
      fontWeight: 800,
      marginBottom: 6,
    },
    h1: { fontWeight: 900, fontSize: 28, margin: 0 },
    sub: { fontSize: 16, color: "#a9c4e0", marginTop: 6 },

    shell: { maxWidth: 1200, margin: "0 auto" },

    row: {
      display: "flex",
      gap: 16,
      justifyContent: "center",
      flexWrap: "wrap",
      margin: "16px 0",
    },
    mcard: {
      background:
        "linear-gradient(180deg, rgba(15,23,42,.75), rgba(15,23,42,.6))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 16,
      boxShadow: "0 18px 50px rgba(0,0,0,.35)",
      padding: 16,
      minWidth: 200,
      textAlign: "center",
    },
    micon: {
      fontSize: 26,
      marginBottom: 6,
      filter: "drop-shadow(0 0 12px rgba(34,211,238,.35))",
    },

    card: {
      background:
        "linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.66))",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 16,
      boxShadow: "0 22px 60px rgba(0,0,0,.35)",
      margin: "0 auto 16px",
      padding: 0,
      overflow: "hidden",
    },
    body: { padding: 18 },

    controls: { display: "flex", alignItems: "center", gap: 10 },
    select: {
      padding: "8px 10px",
      border: "1px solid rgba(148,163,184,.25)",
      borderRadius: 10,
      background: "rgba(2,6,23,.55)",
      color: "#e6f3ff",
      outline: "none",
    },

    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      borderRadius: 12,
    },
    th: {
      textAlign: "left",
      padding: "12px",
      color: "#eaf6ff",
      fontWeight: 900,
      borderBottom: "1px solid rgba(148,163,184,.22)",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid rgba(148,163,184,.22)",
      color: "#e6f3ff",
    },

    btn: {
      height: 44,
      padding: "0 18px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,.22)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
      color: "#e6f3ff",
      fontWeight: 900,
      cursor: "pointer",
      transition: "transform .2s",
    },

    info: {
      background:
        "linear-gradient(180deg, rgba(34,197,94,.10), rgba(34,197,94,.06))",
      color: "#c8fde0",
      border: "1px solid rgba(34,197,94,.25)",
      borderRadius: 14,
      padding: 16,
      textAlign: "center",
      fontSize: 14,
      margin: "16px auto 0",
    },
  };

  return (
    <div className="wq-page" style={S.page}>
      {/* Small CSS block for aurora background + table theme (no zebra rows) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');
        .wq-page{
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          background:
            radial-gradient(1200px 600px at -15% -10%, rgba(34,211,238,.16), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(96,165,250,.14), transparent 55%),
            linear-gradient(135deg,#0a0f1e 0%,#0a1726 45%,#0b1d31 100%);
          overflow-x: hidden;
          isolation:isolate;
        }
        .wq-page::before,.wq-page::after{
          content:"";position:fixed;inset:-20vmax;z-index:-1;
          background:
            radial-gradient(32vmax 32vmax at 20% 20%, rgba(34,211,238,.12), transparent 60%),
            radial-gradient(28vmax 28vmax at 80% 10%, rgba(96,165,250,.12), transparent 60%),
            radial-gradient(26vmax 26vmax at 60% 80%, rgba(59,130,246,.10), transparent 60%);
          filter:blur(48px) saturate(120%);
          animation:aurora 30s linear infinite;
          opacity:.9;
        }
        .wq-page::after{animation-duration:40s;animation-direction:reverse;opacity:.6}
        @keyframes aurora{
          0%{transform:translate3d(0,0,0) rotate(0)}
          50%{transform:translate3d(2%,-1%,0) rotate(180deg)}
          100%{transform:translate3d(0,0,0) rotate(360deg)}
        }

        .wq-table { border:1px solid rgba(148,163,184,.18); background: rgba(3,7,18,.50); border-radius:12px; overflow:hidden; }
        .wq-table thead tr{ background: linear-gradient(180deg,#06b6d4,#0891b2); }
        .wq-table tbody tr{ background: rgba(2,6,23,.78); } /* same bg for all rows (no zebra) */
        .wq-table tbody tr + tr{ border-top:1px solid rgba(148,163,184,.22); }
        .btn-press:hover{ transform: translateY(-1.5px); }
      `}</style>

      <div style={S.header}>
        <div style={S.tag}>🧪 Water Quality</div>
        <h1 style={S.h1}>Water Quality Dashboard</h1>
        <div style={S.sub}>
          Tank ID: <b style={{ color: "#9ddcff" }}>{tankId}</b>
        </div>
        <div style={{ marginTop: 10, fontSize: 16 }}>
          Latest Status:{" "}
          <span style={{ fontWeight: 900, color: statusColor }}>
            {latest?.status || "--"}
          </span>
        </div>
      </div>

      <div style={S.shell}>
        {/* Summary metrics */}
        <div style={S.row}>
          <div style={S.mcard}>
            <div style={S.micon}>🧪</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{avgPh}</div>
            <div style={{ color: "#a9c4e0" }}>Avg. pH</div>
          </div>
          <div style={S.mcard}>
            <div style={S.micon}>💧</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{avgTds}</div>
            <div style={{ color: "#a9c4e0" }}>Avg. TDS</div>
          </div>
          <div style={S.mcard}>
            <div style={S.micon}>⏰</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              {latest ? new Date(latest.timestamp).toLocaleString() : "--"}
            </div>
            <div style={{ color: "#a9c4e0" }}>Last Update</div>
          </div>
        </div>

        {/* Trends chart */}
        <div style={S.card}>
          <div style={S.body}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h2 style={{ color: "#9ddcff", margin: 0, fontWeight: 900 }}>
                Water Quality Trends
              </h2>
              <div style={S.controls}>
                <label htmlFor="range-select">Range</label>
                <select
                  id="range-select"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  style={S.select}
                >
                  <option value="1h">Last Hour</option>
                  <option value="1d">Last Day</option>
                  <option value="1w">Last Week</option>
                </select>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={filteredRecords} margin={{ top: 12, right: 8, bottom: 6, left: -4 }}>
                <defs>
                  <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  tick={{ fill: "#cfeaff" }}
                  axisLine={{ stroke: "rgba(148,163,184,.25)" }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 14]}
                  tickCount={8}
                  tick={{ fill: "#cfeaff" }}
                  axisLine={{ stroke: "rgba(148,163,184,.25)" }}
                  label={{
                    value: "pH",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#9ddcff",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 1000]}
                  tick={{ fill: "#cfeaff" }}
                  axisLine={{ stroke: "rgba(148,163,184,.25)" }}
                  label={{
                    value: "TDS (mg/L)",
                    angle: 90,
                    position: "insideRight",
                    fill: "#cbd5ff",
                  }}
                />
                <Tooltip
                  labelFormatter={(v) => `Time: ${new Date(v).toLocaleString()}`}
                  contentStyle={{
                    background: "rgba(3,7,18,.92)",
                    border: "1px solid rgba(148,163,184,.25)",
                    borderRadius: 10,
                    color: "#eaf6ff",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ color: "#cfeaff", paddingBottom: 10 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="phLevel"
                  stroke="url(#phGrad)"
                  strokeWidth={3}
                  name="pH Level"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tds"
                  stroke="url(#tdsGrad)"
                  strokeWidth={3}
                  name="TDS (mg/L)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent records */}
        <div style={S.card}>
          <div style={S.body}>
            <h2 style={{ color: "#9ddcff", margin: 0, marginBottom: 10, fontWeight: 900 }}>
              Recent Water Quality Records
            </h2>
            <div style={S.tableWrap}>
              <table className="wq-table" style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Date/Time</th>
                    <th style={S.th}>pH</th>
                    <th style={S.th}>TDS</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td style={S.td} colSpan="4">
                        Loading...
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    [...records]
                      .reverse()
                      .slice(0, 10)
                      .map((rec, idx) => (
                        <tr key={rec._id || idx}>
                          <td style={S.td}>
                            {new Date(rec.timestamp).toLocaleString()}
                          </td>
                          <td style={S.td}>{rec.phLevel}</td>
                          <td style={S.td}>{rec.tds}</td>
                          <td
                            style={{
                              ...S.td,
                              fontWeight: 900,
                              color:
                                (rec.status || "").toLowerCase() === "unsafe"
                                  ? "#ef4444"
                                  : "#10b981",
                            }}
                          >
                            {rec.status}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td style={S.td} colSpan="4">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Link to="/homepage" style={{ textDecoration: "none" }}>
            <button className="btn-press" style={S.btn}>Back to Home</button>
          </Link>
        </div>

        {/* Info/help */}
        <div style={S.info}>
          <div style={{ fontWeight: 900, marginBottom: 4 }}>
            What do these values mean?
          </div>
          pH should be between 6.5 and 8.5 for safe water. TDS (Total Dissolved
          Solids) below 500 mg/L is considered good. If status shows “Unsafe”,
          please take action or contact support.
        </div>
      </div>
    </div>
  );
}

export default ClientWaterQualityDashboard;
