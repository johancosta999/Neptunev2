import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./homepage.css"; // we will update this with modern styles

// 🔹 Nav Component
function Nav({ tankId }) {
  return (
    <nav className="navbar">
      <h1 className="brand">Neptune</h1>
      <ul className="nav-links">
        <Link to={`/water-level-chart/${tankId}`}><li>💧 Water Level</li></Link>
        <Link to={`/tank/${tankId}/billing`}><li>💰 Billing</li></Link>
        <Link to={"/issues/new"}><li>⚠️ Issues</li></Link>
      </ul>
      <Link to={"/"}><button className="logout-btn">Log out</button></Link>
    </nav>
  );
}

// 🔹 Footer Component
function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Neptune Smart Water System</p>
    </footer>
  );
}

// 🔹 Weekly Summary Logic
const getWeeklyWaterLevelSummary = (records, capacity) => {
  if (!Array.isArray(records)) return [];
  const grouped = {};

  records.forEach((rec) => {
    const date = new Date(rec.recordedAt || rec.timestamp).toLocaleDateString();
    const level = parseFloat(rec.waterLevel ?? rec.level ?? rec.currentLevel ?? 0);

    if (!grouped[date]) grouped[date] = { totalLevel: 0, count: 0, refillCycles: 0 };
    grouped[date].totalLevel += level;
    grouped[date].count += 1;

    if (level >= 98) grouped[date].refillCycles += 1; // refill cycle counted
  });

  return Object.entries(grouped).map(([date, { totalLevel, count, refillCycles }]) => {
    const units = (refillCycles * capacity) / 1000;
    const price = units * 20; // Rs 20 per unit
    return {
      date,
      totalLevel,
      averageLevel: totalLevel / count,
      refillCycles,
      price,
    };
  });
};

const calculateMonthlyBill = (weeklySummary) => {
  if (!Array.isArray(weeklySummary)) return { total: 0, rows: [] };
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthRows = weeklySummary.filter(row => {
    const rowDate = new Date(row.date);
    return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
  });

  const total = thisMonthRows.reduce((sum, row) => sum + row.price, 0);
  return { total, rows: thisMonthRows };
};

// 🔹 HomePage
function HomePage() {
  const tankId = localStorage.getItem("tankId");

  const [tankDetails, setTankDetails] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentBill, setCurrentBill] = useState(0);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("Loading...");

  useEffect(() => {
    if (!tankId) return;

    const fetchData = async () => {
      try {
        // Tank Details
        const tankRes = await axios.get(`http://localhost:5000/api/sellers/${tankId}`);
        setTankDetails(tankRes.data);

        // Water Level
        const levelRes = await axios.get(`http://localhost:5000/api/waterlevel?tankId=${tankId}`);
        const levelData = levelRes.data.data || [];
        if (levelData.length > 0) {
          const latest = levelData[levelData.length - 1];
          setCurrentLevel(latest.currentLevel ?? latest.waterLevel ?? latest.level ?? 0);
        }

        // Water Quality
        const qualityRes = await axios.get(`http://localhost:5000/api/waterquality?tankId=${tankId}`);
        const qualityData = qualityRes.data.data || [];
        setCurrentStatus(
          qualityData.length > 0 ? qualityData[qualityData.length - 1].status : "No data"
        );

        // Calculate Billing
        const summary = getWeeklyWaterLevelSummary(levelData, tankRes.data?.capacity ?? 0);
        const monthly = calculateMonthlyBill(summary);
        setCurrentBill(monthly.total);

        // Issues
        const issuesRes = await axios.get(`http://localhost:5000/api/issues/${tankId}`);
        setIssues(issuesRes.data || []);
      } catch (err) {
        console.error("❌ Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [tankId]);

  return (
    <div className="homepage-container">
      <Nav tankId={tankId} />

      <div className="welcome-banner">
        <h2>🏷️ Logged in as <strong>{tankId}</strong></h2>
      </div>

      <main className="dashboard-grid">
        <Link to={`/water-level-chart/${tankId}`} className="card card-blue">
          <h3>💧 Current Water Level</h3>
          <p>{loading ? "Loading..." : `${currentLevel}%`}</p>
        </Link>

        <Link to={`/tank/${tankId}/billing`} className="card card-green">
          <h3>💰 Current Bill</h3>
          <p>{loading ? "Loading..." : `Rs ${currentBill.toFixed(2)}`}</p>
        </Link>

        <Link to={`/water-quality-chart/${tankId}`} className="card card-yellow">
          <h3>🧪 Current Water Quality</h3>
          <p>{loading ? "Loading..." : currentStatus}</p>
        </Link>

        <div className="card card-red">
          <h3>⚠️ Issues Reported</h3>
          {loading ? (
            <p>Loading...</p>
          ) : issues.length > 0 ? (
            <ul>
              {issues.map((issue, idx) => <li key={idx}>{issue.description || "Unknown issue"}</li>)}
            </ul>
          ) : <p>No issues reported.</p>}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
