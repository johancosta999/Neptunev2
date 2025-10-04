import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./homepage.css"; // Modern liquid glass styles

// 🔹 Enhanced Nav Component with Modern Design
function Nav({ tankId, onProfileClick }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">🌊</div>
        <h1 className="brand">Neptune</h1>
        <span className="brand-tagline">Smart Water System</span>
      </div>
      <ul className="nav-links">
        <Link to={`/water-level-chart/${tankId}`} className="nav-link">
          <div className="nav-icon">💧</div>
          <span>Water Level</span>
        </Link>
        <Link to={`/client/billing`} className="nav-link">
          <div className="nav-icon">💰</div>
          <span>Billing</span>
        </Link>

        <Link to={"/client/water-quality"} className="nav-link">
          <div className="nav-icon">🦠</div>
          <span>Water Quality</span>
        </Link>

        <Link to={"/issues/new"} className="nav-link">
          <div className="nav-icon">⚠️</div>
          <span>Issues</span>
        </Link>
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="profile-btn" onClick={onProfileClick} style={{marginRight: 8}}>
          <span role="img" aria-label="profile">👤</span> Profile
        </button>
        <Link to={"/"}>
          <button className="logout-btn">
            <span className="logout-icon">🚪</span>
            Log out
          </button>
        </Link>
      </div>
    </nav>
  );
}
// Customer Profile Modal
function ProfileModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    try {
      // Replace with your actual API endpoint and user identification logic
      const userId = localStorage.getItem("userId");
      await axios.put(`http://localhost:5000/api/sellers/${userId}/password`, {
        currentPassword,
        newPassword
      });
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Failed to update password. Please check your current password.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Customer Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="profile-form">
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{marginTop: 12}}>Update Password</button>
            {message && <div style={{marginTop: 8, color: message.includes("success") ? "green" : "red"}}>{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

// 🔹 Enhanced Footer Component
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-icon">🌊</span>
            <span className="footer-name">Neptune</span>
          </div>
          <p className="footer-tagline">Revolutionizing Water Management</p>
        </div>
        <div className="footer-links">
          <div className="footer-section">
            <h4>Support</h4>
            <a href="tel:+1-800-NEPTUNE">24/7 Hotline</a>
            <Link to="/issues/new">Report Issue</Link>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <a href="#upgrade">Tank Upgrade</a>
            <a href="#cleanup">Cleanup Request</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Neptune Smart Water System. All rights reserved.</p>
      </div>
    </footer>
  );
}

// 🔹 Tank Image Component based on capacity
function TankImage({ capacity }) {
  const getTankImage = (cap) => {
    if (cap <= 500) return "🪣"; // Small tank
    if (cap <= 1000) return "🛢️"; // Medium tank
    if (cap <= 2000) return "🏺"; // Large tank
    return "🏗️"; // Extra large tank
  };

  const getTankSize = (cap) => {
    if (cap <= 500) return "Small";
    if (cap <= 1000) return "Medium";
    if (cap <= 2000) return "Large";
    return "Extra Large";
  };

  return (
    <div className="tank-visual">
      <div className="tank-icon">{getTankImage(capacity)}</div>
      <div className="tank-info">
        <span className="tank-capacity">{capacity}L</span>
        <span className="tank-size">{getTankSize(capacity)}</span>
      </div>
    </div>
  );
}

// 🔹 Upgrade Tank Modal Component
function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚀 Upgrade Your Tank</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="upgrade-options">
            <div className="upgrade-card">
              <div className="upgrade-icon">⭐</div>
              <h3>Premium Features</h3>
              <ul>
                <li>🔍 Advanced Analytics</li>
                <li>📱 Mobile App Integration</li>
                <li>🚨 Real-time Alerts</li>
                <li>📊 Custom Reports</li>
              </ul>
              <div className="upgrade-price">$99/month</div>
            </div>
            <div className="upgrade-card featured">
              <div className="upgrade-icon">💎</div>
              <h3>Enterprise</h3>
              <ul>
                <li>🏢 Multi-tank Management</li>
                <li>👥 Team Collaboration</li>
                <li>🔧 Priority Support</li>
                <li>🔗 API Access</li>
              </ul>
              <div className="upgrade-price">$199/month</div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>Maybe Later</button>
            <button className="btn-primary">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
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

// 🔹 Enhanced HomePage with Modern Design

function HomePage() {
  const tankId = localStorage.getItem("tankId");
  const [tankDetails, setTankDetails] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentBill, setCurrentBill] = useState(0);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("Loading...");
  const [registeredTanks, setRegisteredTanks] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

        // Registered Tanks (for the new section)
        const tanksRes = await axios.get("http://localhost:5000/api/sellers");
        setRegisteredTanks(tanksRes.data.data?.slice(0, 6) || []); // Show first 6 tanks
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'safe': return '#10b981';
      case 'unsafe': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLevelColor = (level) => {
    if (level >= 80) return '#10b981';
    if (level >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="homepage-container">
      <Nav tankId={tankId} onProfileClick={() => setShowProfileModal(true)} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome back, <span className="hero-tank-id">{tankId}</span></h1>
            <p className="hero-subtitle">Monitor your Neptune smart water system in real-time</p>
          </div>
          <div className="hero-visual">
            {tankDetails && <TankImage capacity={tankDetails.capacity} />}
          </div>
        </div>
        <div className="hero-actions">
          <button 
            className="hero-btn primary"
            onClick={() => setShowUpgradeModal(true)}
          >
            🚀 Upgrade Your Tank
          </button>
          <Link to="/issues/new" className="hero-btn secondary">
            🧹 Request Cleanup
          </Link>
        </div>
      </section>

      {/* Dashboard Cards */}
      <main className="dashboard-grid">
        <Link to={`/water-level-chart/${tankId}`} className="dashboard-card water-level">
          <div className="card-header">
            <div className="card-icon">💧</div>
            <h3>Water Level</h3>
          </div>
          <div className="card-content">
            <div className="metric-value" style={{ color: getLevelColor(currentLevel) }}>
              {loading ? "..." : `${currentLevel}%`}
            </div>
            <div className="level-bar">
              <div 
                className="level-fill" 
                style={{ 
                  width: `${currentLevel}%`,
                  backgroundColor: getLevelColor(currentLevel)
                }}
              ></div>
            </div>
          </div>
        </Link>

        <Link to={`/client/billing`} className="dashboard-card billing">
          <div className="card-header">
            <div className="card-icon">💰</div>
            <h3>Current Bill</h3>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {loading ? "..." : `Rs ${currentBill.toFixed(2)}`}
            </div>
            <div className="metric-subtitle">This month</div>
          </div>
        </Link>

        <Link to={`/water-quality-chart/${tankId}`} className="dashboard-card water-quality">
          <div className="card-header">
            <div className="card-icon">🧪</div>
            <h3>Water Quality</h3>
          </div>
          <div className="card-content">
            <div className="status-indicator">
              <div 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor(currentStatus) }}
              ></div>
              <span className="status-text">
                {loading ? "Loading..." : currentStatus}
              </span>
            </div>
          </div>
        </Link>

        <div className="dashboard-card issues">
          <div className="card-header">
            <div className="card-icon">⚠️</div>
            <h3>Recent Issues</h3>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : issues.length > 0 ? (
              <div className="issues-list">
                {issues.slice(0, 3).map((issue, idx) => (
                  <div key={idx} className="issue-item">
                    <div className="issue-priority">{issue.priority || "Normal"}</div>
                    <div className="issue-text">{issue.title || issue.description || "Unknown issue"}</div>
                  </div>
                ))}
                {issues.length > 3 && (
                  <Link to="/issues" className="view-all-link">
                    View all {issues.length} issues →
                  </Link>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>All systems running smoothly</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Registered Tanks Section */}
      <section className="registered-tanks-section">
        <div className="section-header">
          <h2 className="section-title">🏢 Registered Tanks Network</h2>
          <p className="section-subtitle">Connected smart water systems in your area</p>
        </div>
        <div className="tanks-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="tank-card loading">
                <div className="tank-skeleton"></div>
              </div>
            ))
          ) : (
            registeredTanks.map((tank, idx) => (
              <div key={idx} className="tank-card">
                <div className="tank-header">
                  <TankImage capacity={tank.capacity || 1000} />
                  <div className="tank-status online"></div>
                </div>
                <div className="tank-details">
                  <h4 className="customer-name">{tank.customerName || "Anonymous"}</h4>
                  <p className="tank-id">ID: {tank.tankId}</p>
                  <p className="tank-location">{tank.city || "Unknown"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

  <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
  <Footer />
    </div>
  );
}

export default HomePage;
