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
import "./chart.css"; // Professional CSS

function WaterQualityChart() {
  const { tankId } = useParams();
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("1w");

  // 🎨 Professional UI styles
  const styles = {
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      marginBottom: "16px",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    },
    title: { fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 },
    controls: { display: "flex", alignItems: "center", gap: "10px" },
    select: { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#ffffff" },
    body: { padding: "12px 16px" },
  };

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/waterquality?tankId=${tankId}`
      );
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("Error fetching TDS data", err);
    }
  };

  const filterByRange = (data) => {
    const now = new Date();
    let rangeTime;

    if (range === "1h") rangeTime = now - 60 * 60 * 1000;
    else if (range === "1d") rangeTime = now - 24 * 60 * 60 * 1000;
    else if (range === "1w") rangeTime = now - 7 * 24 * 60 * 60 * 1000;

    return data.filter((d) => new Date(d.timestamp) >= rangeTime);
  };

  const filteredRecords = filterByRange(records);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [tankId]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Water Quality (TDS) - {tankId}</h3>
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
      <div style={styles.body}>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={filteredRecords}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <YAxis domain={[0, 1000]} />
            <Tooltip
              labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
              formatter={(val) => [val, "TDS (mg/L)"]}
            />
            <Legend verticalAlign="top" />
            <Line
              type="monotone"
              dataKey="tds"
              stroke="#0ea5e9"
              strokeWidth={3}
              activeDot={{ r: 6 }}
              name="TDS (mg/L)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WaterQualityChart;
