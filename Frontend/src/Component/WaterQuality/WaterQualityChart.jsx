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
  const [selectedParameters, setSelectedParameters] = useState({
    phLevel: true,
    tds: true,
    salinity: false,
    ecValue: false,
    turbidity: false
  });

  // ---- Palette
  const BLUE = "#0ea5e9";     // TDS line
  const AMBER = "#f59e42";    // pH line
  const GREEN = "#10b981";    // Salinity line
  const PURPLE = "#8b5cf6";   // EC Value line
  const ORANGE = "#f97316";   // Turbidity line
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
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    body: { padding: "16px 20px" },
  };

  // ---- Parameter Configuration
  const parameterConfig = {
    phLevel: { 
      name: "pH Level", 
      unit: "", 
      color: AMBER, 
      yAxisId: "right", 
      domain: [0, 14],
      stroke: "#fcd19c",
      label: "pH"
    },
    tds: { 
      name: "TDS", 
      unit: "mg/L", 
      color: BLUE, 
      yAxisId: "left", 
      domain: [0, 1000],
      stroke: "#93c5fd",
      label: "TDS (mg/L)"
    },
    salinity: { 
      name: "Salinity", 
      unit: "ppt", 
      color: GREEN, 
      yAxisId: "salinity", 
      domain: [0, 100],
      stroke: "#10b981",
      label: "Salinity (ppt)"
    },
    ecValue: { 
      name: "EC Value", 
      unit: "μS/cm", 
      color: PURPLE, 
      yAxisId: "ecValue", 
      domain: [0, 10000],
      stroke: "#8b5cf6",
      label: "EC (μS/cm)"
    },
    turbidity: { 
      name: "Turbidity", 
      unit: "NTU", 
      color: ORANGE, 
      yAxisId: "turbidity", 
      domain: [0, 100],
      stroke: "#f97316",
      label: "Turbidity (NTU)"
    }
  };

  // ---- Handlers
  const handleRangeChange = (e) => setRange(e.target.value);
  
  const handleParameterChange = (parameter) => {
    setSelectedParameters(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  const handleSelectAll = () => {
    setSelectedParameters({
      phLevel: true,
      tds: true,
      salinity: true,
      ecValue: true,
      turbidity: true
    });
  };

  const handleClearAll = () => {
    setSelectedParameters({
      phLevel: false,
      tds: false,
      salinity: false,
      ecValue: false,
      turbidity: false
    });
  };

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
    if (range === "1m") from = now - 60 * 1000; // 1 minute
    else if (range === "1h") from = now - 60 * 60 * 1000;
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
            <h3 style={styles.title}>Water Quality (pH, TDS, Salinity, EC, Turbidity)</h3>
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
              <option value="1m">Last Minute</option>
              <option value="1h">Last Hour</option>
              <option value="1d">Last Day</option>
              <option value="1w">Last Week</option>
            </select>
          </div>
        </div>

        {/* Parameter Selector */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h3 style={styles.title}>Select Parameters to Display</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSelectAll}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(16,185,129,0.3)",
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(148,163,184,0.1)",
                  color: "#9aa3b2",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                Clear All
              </button>
            </div>
          </div>
          <div style={styles.body}>
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "12px", 
              alignItems: "center" 
            }}>
              {Object.entries(parameterConfig).map(([key, config]) => (
                <label 
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: selectedParameters[key] 
                      ? `rgba(${config.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.1)` 
                      : "rgba(148,163,184,0.1)",
                    border: `1px solid ${selectedParameters[key] ? config.color : "rgba(148,163,184,0.3)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: selectedParameters[key] ? config.color : "#9aa3b2"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedParameters[key]}
                    onChange={() => handleParameterChange(key)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ 
                    fontWeight: selectedParameters[key] ? "700" : "500",
                    fontSize: "14px"
                  }}>
                    {config.name} {config.unit && `(${config.unit})`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div style={styles.card}>
          <div style={styles.cardBody}>
            {Object.values(selectedParameters).some(selected => selected) ? (
              <ResponsiveContainer width="100%" height={500}>
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
                {Object.entries(parameterConfig).map(([key, config]) => 
                  selectedParameters[key] && (
                    <YAxis
                      key={key}
                      yAxisId={config.yAxisId}
                      orientation={config.yAxisId === "left" ? "left" : "right"}
                      domain={config.domain}
                      stroke={config.stroke}
                      label={{ 
                        value: config.label, 
                        angle: config.yAxisId === "left" ? -90 : 90, 
                        position: config.yAxisId === "left" ? "insideLeft" : "insideRight", 
                        fill: config.stroke 
                      }}
                    />
                  )
                )}
                <Tooltip
                  contentStyle={{ background: INK, border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }}
                  labelStyle={{ color: "#e5e7eb" }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
                  formatter={(val, name, props) => {
                    const config = parameterConfig[props.dataKey];
                    return config ? [val, `${config.name} ${config.unit ? `(${config.unit})` : ''}`] : [val, name];
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ color: "#e5e7eb" }} />
                {Object.entries(parameterConfig).map(([key, config]) => 
                  selectedParameters[key] && (
                    <Line
                      key={key}
                      yAxisId={config.yAxisId}
                      type="monotone"
                      dataKey={key}
                      stroke={config.color}
                      strokeWidth={3}
                      name={`${config.name} ${config.unit ? `(${config.unit})` : ''}`}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  )
                )}
              </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "400px",
                color: "#9aa3b2",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
                  No Parameters Selected
                </h3>
                <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
                  Please select at least one parameter to display on the chart
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaterQualityChart;
