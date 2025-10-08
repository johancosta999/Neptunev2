import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
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

function WaterQualityChart() {
  const { tankId } = useParams();
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("1w");

  // ---- Palette
  const BLUE = "#0ea5e9";     // TDS line
  const AMBER = "#f59e42";    // pH line
  const INK = "rgba(17,24,39,.75)";

  // ---- Styles
  const styles = {
    page: {
      position: "relative",
      minHeight: "100vh",
      padding: "28px 20px",
      color: "#e5e7eb",
      background:
        "linear-gradient(135deg, #0b1020 0%, #0c1b1b 40%, #0d1b2a 100%)",
      overflow: "hidden",
    },
    // animated “water blobs” layer
    bgWrap: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden",
    },
    blob: (size, top, left, color, delay = "0s") => ({
      position: "absolute",
      width: size,
      height: size,
      top,
      left,
      borderRadius: "50%",
      background: `radial-gradient(circle at 30% 30%, ${color}, transparent 65%)`,
      filter: "blur(8px)",
      opacity: 0.5,
      animation: `wq-drift 18s ease-in-out infinite`,
      animationDelay: delay,
    }),

    container: {
      position: "relative",
      zIndex: 1,
      maxWidth: 1280,
      margin: "0 auto",
    },

    headerCard: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "16px 20px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      animation: "wq-fadeUp .5s ease both",
    },
    title: { margin: 0, fontWeight: 900, fontSize: 20, color: "#f8fafc" },
    subtitle: { fontSize: 13, opacity: 0.8 },
    titleStack: { display: "flex", flexDirection: "column", gap: 4 },

    controls: { display: "flex", alignItems: "center", gap: 10, color: "#cbd5e1" },
    select: {
      padding: "8px 10px",
      border: "1px solid rgba(148,163,184,.25)",
      borderRadius: 10,
      background: "rgba(2,6,23,.6)",
      color: "#f8fafc",
      outline: "none",
    },
    pill: {
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: "rgba(59,130,246,.18)",
      color: "#bfdbfe",
      border: "1px solid rgba(59,130,246,.35)",
      marginLeft: 8,
    },

    card: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      animation: "wq-fadeUp .6s ease both .05s",
    },
    cardBody: { padding: "16px 16px 6px" },
  };

  // ---- Handlers
  const handleRangeChange = (e) => setRange(e.target.value);

  // ---- Data fetching
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/waterquality?tankId=${tankId}`
      );
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("Error fetching TDS/pH data", err);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [tankId]);

  // ---- Range filter
  const filterByRange = (data) => {
    const now = new Date();
    let from;
    if (range === "1h") from = now - 60 * 60 * 1000;
    else if (range === "1d") from = now - 24 * 60 * 60 * 1000;
    else from = now - 7 * 24 * 60 * 60 * 1000; // 1w
    return data.filter((d) => new Date(d.timestamp) >= from);
  };
  const filtered = filterByRange(records);

  return (
    <div style={styles.page}>
      {/* keyframes & small responsive tweak */}
      <style>{`
        @keyframes wq-drift {
          0%   { transform: translate3d(0, 0, 0) scale(1);   opacity: .45; }
          50%  { transform: translate3d(20px, -30px, 0) scale(1.08); opacity: .65; }
          100% { transform: translate3d(0, 0, 0) scale(1);   opacity: .45; }
        }
        @keyframes wq-fadeUp {
          0% { opacity: 0; transform: translateY(8px) }
          100% { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      {/* animated background blobs */}
      <div style={styles.bgWrap} aria-hidden="true">
        <span style={styles.blob("44vmax", "8%", "-12%", "rgba(14,165,233,.18)")} />
        <span style={styles.blob("38vmax", "55%", "75%", "rgba(99,102,241,.14)", ".6s")} />
        <span style={styles.blob("30vmax", "70%", "-10%", "rgba(16,185,129,.16)", "1.1s")} />
      </div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerCard}>
          <div style={styles.titleStack}>
            <h3 style={styles.title}>Water Quality (TDS & pH)</h3>
            <div style={styles.subtitle}>
              Tank: <strong>{tankId}</strong>
              <span style={styles.pill}>Live (5s refresh)</span>
            </div>
          </div>
          <div style={styles.controls}>
            <label htmlFor="range-select">Range</label>
            <select
              id="range-select"
              value={range}
              onChange={handleRangeChange}
              style={styles.select}
            >
              <option value="1h">Last Hour</option>
              <option value="1d">Last Day</option>
              <option value="1w">Last Week</option>
            </select>
          </div>
        </div>

        {/* Chart Card */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,.2)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#cbd5e1"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 1000]}
                  stroke="#93c5fd"
                  label={{ value: "TDS (mg/L)", angle: -90, position: "insideLeft", fill: "#93c5fd" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 14]}
                  stroke="#fcd19c"
                  label={{ value: "pH", angle: 90, position: "insideRight", fill: "#fcd19c" }}
                />
                <Tooltip
                  contentStyle={{ background: INK, border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }}
                  labelStyle={{ color: "#e5e7eb" }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
                  formatter={(val, name, props) => {
                    if (props.dataKey === "tds") return [val, "TDS (mg/L)"];
                    if (props.dataKey === "phLevel") return [val, "pH Level"];
                    return [val, name];
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ color: "#e5e7eb" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tds"
                  stroke={BLUE}
                  strokeWidth={3}
                  name="TDS (mg/L)"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="phLevel"
                  stroke={AMBER}
                  strokeWidth={3}
                  name="pH Level"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaterQualityChart;
