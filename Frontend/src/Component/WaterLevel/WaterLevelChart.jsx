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
import "./WaterLevel.css";

function WaterLevelChart({ records = [] }) {
  const { tankId } = useParams();
  const [chartRecords, setChartRecords] = useState([]);
  const [range, setRange] = useState("1w");
  const [loading, setLoading] = useState(false);

  // Color palette
  const WATER_BLUE = "#0ea5e9";
  const WATER_CYAN = "#06b6d4";
  const INK = "rgba(17,24,39,.75)";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/waterlevel?tankId=${tankId}`
      );
      setChartRecords(res.data.data || []);
    } catch (err) {
      console.error("Error fetching water level data", err);
    } finally {
      setLoading(false);
    }
  };

  const filterByRange = (data) => {
    const now = new Date();
    let rangeTime;

    if (range === "1h") rangeTime = now - 60 * 60 * 1000;
    else if (range === "1d") rangeTime = now - 24 * 60 * 60 * 1000;
    else if (range === "1w") rangeTime = now - 7 * 24 * 60 * 60 * 1000;

    return data.filter(
      (d) => new Date(d.recordedAt || d.timestamp) >= rangeTime
    );
  };

  // Use passed records or fetched records
  const dataToUse = records.length > 0 ? records : chartRecords;
  const filteredRecords = filterByRange(dataToUse);

  useEffect(() => {
    if (records.length === 0) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [tankId, records.length]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">💧 Water Level - {tankId}</h3>
        <div className="chart-controls">
          <label htmlFor="range" style={{ color: "var(--muted)", fontSize: "14px" }}>Range:</label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="chart-select"
          >
            <option value="1h">Last Hour</option>
            <option value="1d">Last Day</option>
            <option value="1w">Last Week</option>
          </select>
          <span style={{ 
            fontSize: "12px", 
            color: "var(--muted)", 
            background: "rgba(34,211,238,.1)", 
            padding: "4px 8px", 
            borderRadius: "6px",
            border: "1px solid rgba(34,211,238,.2)"
          }}>
            Live (5s refresh)
          </span>
        </div>
      </div>
      
      <div style={{ position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            background: "rgba(0,0,0,.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "14px"
          }}>
            Loading chart data...
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={filteredRecords}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(145,177,208,.2)" 
            />
            <XAxis
              dataKey="recordedAt"
              stroke="#9fb8d3"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(v) => `${v}%`}
              stroke="#9fb8d3"
            />
            <Tooltip
              contentStyle={{ 
                background: INK, 
                border: "1px solid rgba(255,255,255,.08)", 
                borderRadius: 12,
                color: "var(--text)"
              }}
              labelStyle={{ color: "var(--text)" }}
              itemStyle={{ color: "var(--text)" }}
              labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
              formatter={(val) => [`${val}%`, "Water Level"]}
            />
            <Legend 
              verticalAlign="top" 
              wrapperStyle={{ color: "var(--text)" }} 
            />
            <Line
              type="monotone"
              dataKey="currentLevel"
              stroke={WATER_BLUE}
              strokeWidth={3}
              activeDot={{ 
                r: 6, 
                fill: WATER_CYAN,
                stroke: WATER_BLUE,
                strokeWidth: 2
              }}
              name="Water Level (%)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {filteredRecords.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No water level data available for the selected range</div>
        </div>
      )}
    </div>
  );
}

export default WaterLevelChart;
