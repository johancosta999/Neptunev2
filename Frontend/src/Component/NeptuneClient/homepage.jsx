// HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

/* ---------------------------------------------
   Water-themed Dark UI styles injected inline
---------------------------------------------- */
const WaterThemeStyles = () => (
  <style>{`
/* Font & base reset */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap");
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:#0a0f1e;color:#e5f6ff;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"}
a{text-decoration:none}
a:hover{text-decoration:none}

:root{
  --ink-900:#0a0f1e; --glass-strong:#0b1224f0; --card:#0e162d; --line:#1d2d4a;
  --text:#e6f3ff; --muted:#9fb8d3; --brand:#22d3ee; --ok:#10b981; --warn:#f59e0b; --bad:#ef4444;
}

/* Animated background */
.homepage-container{
  position:relative;min-height:100vh;overflow-x:hidden;
  background:
    radial-gradient(1200px 600px at -15% -10%, rgba(34,211,238,.18), transparent 60%),
    radial-gradient(900px 500px at 110% 0%, rgba(96,165,250,.16), transparent 55%),
    linear-gradient(135deg, #0a0f1e 0%, #0a1726 45%, #0b1d31 100%);
  isolation:isolate;
}
.homepage-container::before,.homepage-container::after{
  content:"";position:fixed;inset:-20vmax;
  background:
    radial-gradient(35vmax 35vmax at 20% 20%, rgba(34,211,238,.12), transparent 60%),
    radial-gradient(30vmax 30vmax at 80% 10%, rgba(96,165,250,.12), transparent 60%),
    radial-gradient(28vmax 28vmax at 60% 80%, rgba(59,130,246,.10), transparent 60%);
  filter:blur(45px) saturate(120%);z-index:-2;animation:aurora 26s linear infinite;opacity:.9
}
.homepage-container::after{animation-duration:34s;animation-direction:reverse;opacity:.6}
@keyframes aurora{0%{transform:translate3d(0,0,0) rotate(0)}50%{transform:translate3d(2%,-1%,0) rotate(180deg)}100%{transform:translate3d(0,0,0) rotate(360deg)}}

/* Navbar */
.navbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;background:linear-gradient(180deg, rgba(9,14,28,.8), rgba(9,14,28,.55));backdrop-filter:blur(10px);border-bottom:1px solid #0f1f3b}
.nav-brand{display:flex;align-items:center;gap:10px}
.brand-icon{font-size:22px;filter:drop-shadow(0 2px 8px rgba(34,211,238,.6))}
.brand{font-size:20px;font-weight:900;letter-spacing:.3px;color:#dff7ff;margin:0}
.brand-tagline{color:#9fb8d3;font-size:12px;margin-left:6px}
.nav-links{display:flex;align-items:center;gap:10px;padding:0;margin:0}
.nav-link{display:flex;align-items:center;gap:8px;padding:10px 12px;color:#d9eeff;text-decoration:none;border:1px solid rgba(145,177,208,.15);background:linear-gradient(180deg, rgba(14,22,45,.7), rgba(14,22,45,.55));border-radius:12px;transition:.25s}
.nav-link:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(34,211,238,.12);border-color:rgba(145,177,208,.3)}
.nav-icon{filter:drop-shadow(0 0 18px rgba(34,211,238,.35))}
.profile-btn,.logout-btn{height:40px;padding:0 14px;border-radius:12px;font-weight:800;cursor:pointer;border:1px solid rgba(145,177,208,.15);background:linear-gradient(180deg, rgba(14,22,45,.7), rgba(14,22,45,.55));color:#dff7ff;transition:.25s}
.profile-btn:hover,.logout-btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(96,165,250,.12)}
.logout-btn{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg, rgba(220,38,38,.16), rgba(220,38,38,.06));border-color:rgba(220,38,38,.25)}

/* Hero */
.hero-section{max-width:1200px;margin:18px auto 8px;padding:18px;border:1px solid rgba(145,177,208,.14);background:linear-gradient(180deg, rgba(15,23,42,.7), rgba(15,23,42,.5));border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)}
.hero-content{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px}
.hero-title{margin:0 0 6px;font-size:clamp(26px,3.6vw,46px);line-height:1.08;font-weight:900;letter-spacing:.3px;color:#e7f7ff;text-shadow:0 10px 30px rgba(0,0,0,.45)}
.hero-tank-id{color:#22d3ee;text-shadow:0 0 18px rgba(34,211,238,.55),0 8px 26px rgba(34,211,238,.18)}
.hero-subtitle{margin:0;color:#a9c4e0;font-weight:600}
.tank-visual{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;border:1px solid rgba(145,177,208,.14);background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(145,177,208,.05),0 18px 50px rgba(0,0,0,.35);animation:float 6s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.tank-icon{width:64px;height:64px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 12px 30px rgba(96,165,250,.3))}
.tank-info{display:flex;flex-direction:column;align-items:center;gap:2px;font-weight:800;color:#dff7ff}
.hero-actions{display:flex;gap:12px;padding:0 18px 12px;flex-wrap:wrap}
.hero-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:14px;font-weight:900;text-decoration:none;border:1px solid transparent;transition:.25s}
.hero-btn.primary{color:#071d21;background:linear-gradient(135deg, #22d3ee, #60a5fa);box-shadow:0 18px 44px rgba(34,211,238,.28),inset 0 0 0 1px rgba(255,255,255,.2)}
.hero-btn.secondary{color:#dff7ff;border-color:rgba(145,177,208,.2);background:linear-gradient(180deg, rgba(14,22,45,.7), rgba(14,22,45,.55))}
.hero-btn:hover{transform:translateY(-2px) scale(1.01);filter:saturate(110%)}

/* Dashboard */
.dashboard-grid{max-width:1200px;margin:12px auto 24px;padding:0 6px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.dashboard-card{position:relative;overflow:hidden;padding:14px;border-radius:16px;background:linear-gradient(180deg, var(--card), #0b1428);border:1px solid var(--line);color:var(--text);transition:transform .25s, box-shadow .25s, border-color .25s;text-decoration:none}
.dashboard-card::after{content:"";position:absolute;inset:-60% -30%;background:conic-gradient(from 180deg at 50% 50%, transparent 0 40%, rgba(34,211,238,.08), rgba(96,165,250,.05), transparent 85% 100%);animation:spin 9s linear infinite;pointer-events:none;z-index:0}
@keyframes spin{to{transform:rotate(360deg)}}
.dashboard-card:hover{transform:translateY(-4px);box-shadow:0 22px 60px rgba(34,211,238,.14);border-color:rgba(145,177,208,.35);text-decoration:none}
.card-header{display:flex;align-items:center;gap:10px;position:relative;z-index:1}
.card-icon{font-size:22px;filter:drop-shadow(0 0 14px rgba(34,211,238,.35))}
.card-content{margin-top:10px;position:relative;z-index:1}
.metric-value{font-size:28px;font-weight:900;letter-spacing:.3px}
.metric-subtitle{color:#9fb8d3;font-weight:600}
.level-bar{height:8px;border-radius:999px;background:#0f1f3b;overflow:hidden;border:1px solid var(--line);margin-top:8px}
.level-fill{height:100%;border-radius:999px;background:var(--ok);transition:width .5s}
.status-indicator{display:flex;align-items:center;gap:8px}
.status-dot{width:10px;height:10px;border-radius:50%;box-shadow:0 0 14px currentColor}
.status-text{font-weight:800}
.issues-list{display:flex;flex-direction:column;gap:8px}
.issue-item{display:grid;grid-template-columns:100px 1fr;gap:10px;align-items:center;background:rgba(255,255,255,.03);border:1px dashed rgba(145,177,208,.25);padding:8px;border-radius:10px}
.issue-priority{font-weight:900;font-size:12px;color:#ffe8a3}
.issue-text{color:#dfefff}
.view-all-link{margin-top:6px;display:inline-block;color:#9ddcff;text-decoration:none;font-weight:800}
.view-all-link:hover{color:#22d3ee;transform:translateX(4px)}
.loading-state{color:#9fb8d3}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:8px;color:#9fb8d3}
.empty-icon{font-size:26px}

/* Registered tanks */
.registered-tanks-section{max-width:1200px;margin:10px auto 36px;padding:0 6px}
.section-header{display:flex;align-items:end;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.section-title{margin:0;font-weight:900;letter-spacing:.3px}
.section-subtitle{margin:0;color:#9fb8d3}
.tanks-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}
.tank-card{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:14px;padding:10px;background:linear-gradient(180deg, #0e162d, #0a1326);transition:.25s}
.tank-card:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(96,165,250,.12);border-color:rgba(145,177,208,.35)}
.tank-header{display:flex;align-items:center;justify-content:space-between}
.tank-status{width:10px;height:10px;border-radius:50%}
.tank-status.online{background:var(--ok);box-shadow:0 0 12px var(--ok)}
.tank-details{margin-top:8px}
.customer-name{margin:0 0 2px;font-size:14px;font-weight:800;color:#e6f3ff}
.tank-id,.tank-location{margin:0;color:#9fb8d3;font-size:12px}
.tank-card.loading{background:linear-gradient(90deg,#0e1428 25%,#111a33 37%,#0e1428 63%);background-size:400% 100%;animation:shimmer 1.4s ease infinite;border-color:transparent}
.tank-skeleton{height:64px;border-radius:10px}
@keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}

/* Modals */
.modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg, rgba(0,0,0,.65), rgba(3,7,18,.75));backdrop-filter:blur(2px)}
.modal-content{width:min(680px,92vw);background:var(--glass-strong);border:1px solid rgba(145,177,208,.2);border-radius:16px;color:var(--text);padding:16px;box-shadow:0 30px 80px rgba(0,0,0,.45);animation:pop .2s ease-out}
@keyframes pop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
.modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:10px;border-bottom:1px solid rgba(145,177,208,.18)}
.modal-close{height:34px;width:34px;border-radius:10px;border:1px solid rgba(145,177,208,.25);background:rgba(255,255,255,.06);color:#e6f3ff;font-weight:900;cursor:pointer}
.modal-body{padding-top:12px}
.profile-form{display:grid;gap:8px}
.profile-form input{height:40px;border-radius:10px;border:1px solid rgba(145,177,208,.25);background:#0b1326;color:#dff7ff;padding:0 10px;outline:none}
.btn-primary,.btn-secondary{height:40px;padding:0 14px;border-radius:12px;font-weight:800;cursor:pointer;border:1px solid transparent}
.btn-primary{background:linear-gradient(135deg,#22d3ee,#60a5fa);color:#06222a}
.btn-secondary{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));color:#e6f3ff;border-color:rgba(145,177,208,.25)}
.btn-primary:hover,.btn-secondary:hover{transform:translateY(-2px)}

/* Footer */
.footer{margin-top:28px;border-top:1px solid rgba(145,177,208,.18);background:linear-gradient(180deg, rgba(9,14,28,.6), rgba(9,14,28,.45))}
.footer-content{max-width:1200px;margin:0 auto;padding:18px 10px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}
.footer-logo{display:flex;align-items:center;gap:8px}
.footer-tagline{color:#9fb8d3;margin:6px 0 0}
.footer-section h4{margin:0 0 6px}
.footer-section a{display:block;text-decoration:none;color:#cdeaff;margin:3px 0;opacity:.9;transition:all 0.3s ease}
.footer-section a:hover{opacity:1;color:#22d3ee;transform:translateX(4px)}
.footer-bottom{text-align:center;color:#9fb8d3;padding:10px;border-top:1px solid rgba(145,177,208,.18)}

/* Responsive */
@media (max-width:1100px){
  .dashboard-grid{grid-template-columns:repeat(2,1fr)}
  .tanks-grid{grid-template-columns:repeat(3,1fr)}
  .hero-content{flex-direction:column;align-items:flex-start}
}
@media (max-width:680px){
  .nav-links{display:none}
  .dashboard-grid{grid-template-columns:1fr}
  .tanks-grid{grid-template-columns:repeat(2,1fr)}
}

/* Scrollbar (webkit) */
*::-webkit-scrollbar{height:10px;width:10px}
*::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#133157,#0f2342);border-radius:999px}
*::-webkit-scrollbar-track{background:transparent}
  `}</style>
);

/* ------------------------ NAV ------------------------ */
function Nav({ onProfileClick, profilePicUrl }) {
  let displayPic = profilePicUrl;
  if (displayPic && !displayPic.startsWith("http")) {
    displayPic = `http://localhost:5000${displayPic}`;
  }
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">🌊</div>
        <h1 className="brand">Neptune</h1>
        <span className="brand-tagline">Smart Water System</span>
      </div>
      <ul className="nav-links">
        <Link to="/client/water-level" className="nav-link"><div className="nav-icon">💧</div><span>Water Level</span></Link>
        <Link to="/client/billing" className="nav-link"><div className="nav-icon">💰</div><span>Billing</span></Link>
        <Link to="/client/water-quality" className="nav-link"><div className="nav-icon">🦠</div><span>Water Quality</span></Link>
        <Link to="/issues/new" className="nav-link"><div className="nav-icon">⚠️</div><span>Issues</span></Link>
      </ul>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #06b6d4", background: "#e0f7fa", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          {displayPic ? (
            <img src={displayPic} alt="Profile" style={{ width: 40, height: 40, objectFit: "cover" }} />
          ) : (
            <span role="img" aria-label="profile" style={{ fontSize: 24 }}>👤</span>
          )}
        </div>
        <button className="profile-btn" onClick={onProfileClick} style={{ marginRight: 8, display: "flex", alignItems: "center", gap: 6 }}>Profile</button>
        <Link to="/"><button className="logout-btn"><span className="logout-icon">🚪</span>Log out</button></Link>
      </div>
    </nav>
  );
}

/* --------------- Profile Modal (password + pic) --------------- */
function ProfileModal({ isOpen, onClose, tankDetails, profilePicUrl, setProfilePicUrl }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(profilePicUrl || "");
  const [picChanged, setPicChanged] = useState(false);
  const [savingPic, setSavingPic] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [removingPic, setRemovingPic] = useState(false);

  useEffect(() => { setPicPreview(profilePicUrl || ""); }, [profilePicUrl]);
  if (!isOpen) return null;

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicFile(file);
      setPicPreview(URL.createObjectURL(file));
      setPicChanged(true);
      setUploadMsg("");
    }
  };

  const handlePicSave = async () => {
    if (!picFile) return;
    setSavingPic(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("profilePic", picFile);
    try {
      await axios.post(`http://localhost:5000/api/sellers/${tankDetails.tankId}/profile-pic`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const sellerRes = await axios.get(`http://localhost:5000/api/sellers/${tankDetails.tankId}`);
      let url = sellerRes.data.profilePicUrl;
      if (url && !url.startsWith("http")) url = `http://localhost:5000${url}`;
      setProfilePicUrl(url);
      setUploadMsg("Profile picture updated!");
      setPicChanged(false);
    } catch {
      setUploadMsg("Failed to upload profile picture.");
    } finally {
      setSavingPic(false);
    }
  };

  const handlePicRemove = async () => {
    setRemovingPic(true);
    setUploadMsg("");
    try {
      await axios.delete(`http://localhost:5000/api/sellers/${tankDetails.tankId}/profile-pic`);
      setProfilePicUrl("");
      setPicPreview("");
      setUploadMsg("Profile picture removed.");
    } catch {
      setUploadMsg("Failed to remove profile picture.");
    } finally {
      setRemovingPic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/sellers/${tankDetails.tankId}/password`, { currentPassword, newPassword });
      setMessage("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      setMessage("Failed to update password. Please check your current password.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Customer Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {uploadMsg && <div style={{marginBottom:12,color:uploadMsg.includes("updated")?"#16a34a":"#ef4444",fontWeight:600,textAlign:"center"}}>{uploadMsg}</div>}
          {message && <div style={{marginBottom:12,color:message.includes("success")?"#16a34a":"#ef4444",fontWeight:600,textAlign:"center"}}>{message}</div>}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
            <img src={picPreview || "/default-profile.png"} alt="Profile" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #06b6d4", marginBottom: 8 }} />
            <input type="file" accept="image/*" onChange={handlePicChange} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn-primary" onClick={handlePicSave} disabled={!picChanged || savingPic}>{savingPic ? "Saving..." : "Save"}</button>
              <button type="button" className="btn-secondary" onClick={handlePicRemove} disabled={removingPic || (!profilePicUrl && !picPreview)} style={{ background: "#eee", color: "#333", border: "1px solid #ccc" }}>
                {removingPic ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div><b>Name:</b> {tankDetails?.customerName || "--"}</div>
            <div><b>Phone:</b> {tankDetails?.contactNumber || "--"}</div>
            <div><b>Email:</b> {tankDetails?.customerEmail || "--"}</div>
            <div><b>Tank Capacity:</b> {tankDetails?.capacity || "--"}L {(() => {
              const cap = Number(tankDetails?.capacity);
              if (cap <= 500) return "(Small)";
              if (cap <= 1000) return "(Medium)";
              if (cap <= 2000) return "(Large)";
              if (cap > 2000) return "(Extra Large)";
              return "";
            })()}</div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* --------------- Footer --------------- */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="footer-logo"><span className="footer-icon">🌊</span><span className="footer-name">Neptune</span></div>
          <p className="footer-tagline">Revolutionizing Water Management</p>
        </div>
        <div className="footer-links" style={{display:"flex", gap:24}}>
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
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Neptune Smart Water System. All rights reserved.</p></div>
    </footer>
  );
}

/* --------------- Tank Image --------------- */
function TankImage({ capacity = 1000 }) {
  // 🖼️ Determine brand by capacity (same logic as TankDashboard.jsx)
  const getBrandByCapacity = (capacityRaw) => {
    if (!capacityRaw) return { name: "Neptune", image: "/Neptune.png" };
    const capacityNum = parseInt(String(capacityRaw).replace(/[^0-9]/g, ""), 10);
    if (Number.isNaN(capacityNum)) return { name: "Neptune", image: "/Neptune.png" };
    if (capacityNum <= 350) return { name: "Aqualite", image: "/aqualite2.png" };
    if (capacityNum <= 750) return { name: "BlueWave", image: "/bluewave2.png" };
    if (capacityNum <= 1000) return { name: "Hydromax", image: "/hydromax.png" };
    return { name: "Neptune", image: "/Neptune.png" };
  };

  const brand = getBrandByCapacity(capacity);
  const size = capacity <= 500 ? "Small" : capacity <= 1000 ? "Medium" : capacity <= 2000 ? "Large" : "Extra Large";
  
  return (
    <div className="tank-visual">
      <div className="tank-icon">
        <img 
          src={brand.image} 
          alt={`${brand.name} tank`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))"
          }}
        />
      </div>
      <div className="tank-info">
        <span className="tank-capacity">{capacity}L</span>
        <span className="tank-size">{brand.name}</span>
      </div>
    </div>
  );
}

/* --------------- Upgrade Modal --------------- */
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
          <div className="upgrade-options" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="upgrade-card" style={{border:"1px solid rgba(145,177,208,.2)",borderRadius:12,padding:12,background:"rgba(255,255,255,.04)"}}>
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
            <div className="upgrade-card featured" style={{border:"1px solid rgba(34,211,238,.35)",borderRadius:12,padding:12,background:"linear-gradient(180deg, rgba(34,211,238,.12), rgba(255,255,255,.03))",boxShadow:"0 10px 30px rgba(34,211,238,.12)"}}>
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
          <div className="modal-actions" style={{display:"flex",gap:10,marginTop:12}}>
            <button className="btn-secondary" onClick={onClose}>Maybe Later</button>
            <button className="btn-primary">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------- Helpers for billing --------------- */
const getWeeklyWaterLevelSummary = (records, capacity) => {
  if (!Array.isArray(records)) return [];
  const grouped = {};
  records.forEach((rec) => {
    const date = new Date(rec.recordedAt || rec.timestamp).toLocaleDateString();
    const level = parseFloat(rec.waterLevel ?? rec.level ?? rec.currentLevel ?? 0);
    if (!grouped[date]) grouped[date] = { totalLevel: 0, count: 0, refillCycles: 0 };
    grouped[date].totalLevel += level;
    grouped[date].count += 1;
    if (level >= 98) grouped[date].refillCycles += 1;
  });
  return Object.entries(grouped).map(([date, { totalLevel, count, refillCycles }]) => {
    const units = (refillCycles * (capacity || 0)) / 1000;
    const price = units * 20;
    return { date, totalLevel, averageLevel: totalLevel / count, refillCycles, price };
  });
};
const calculateMonthlyBill = (weeklySummary) => {
  if (!Array.isArray(weeklySummary)) return { total: 0, rows: [] };
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();
  const rows = weeklySummary.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  return { total: rows.reduce((s, r) => s + r.price, 0), rows };
};

/* --------------- Main HomePage --------------- */
export default function HomePage() {
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
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    if (!tankId) return;
    const fetchData = async () => {
      try {
        const tankRes = await axios.get(`http://localhost:5000/api/sellers/${tankId}`);
        setTankDetails(tankRes.data);
        if (tankRes.data.profilePicUrl) setProfilePicUrl(tankRes.data.profilePicUrl);

        const levelRes = await axios.get(`http://localhost:5000/api/waterlevel?tankId=${tankId}`);
        const levelData = levelRes.data.data || [];
        if (levelData.length > 0) {
          const latest = levelData[levelData.length - 1];
          setCurrentLevel(latest.currentLevel ?? latest.waterLevel ?? latest.level ?? 0);
        }

        const qualityRes = await axios.get(`http://localhost:5000/api/waterquality?tankId=${tankId}`);
        const qualityData = qualityRes.data.data || [];
        setCurrentStatus(qualityData.length > 0 ? (qualityData[qualityData.length - 1].status || "No data") : "No data");

        const summary = getWeeklyWaterLevelSummary(levelData, tankRes.data?.capacity ?? 0);
        const monthly = calculateMonthlyBill(summary);
        setCurrentBill(monthly.total);

        const issuesRes = await axios.get(`http://localhost:5000/api/issues/${tankId}`);
        setIssues(issuesRes.data || []);

        const tanksRes = await axios.get("http://localhost:5000/api/sellers");
        setRegisteredTanks(tanksRes.data.data?.slice(0, 6) || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [tankId]);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "safe": return "#10b981";
      case "unsafe": return "#ef4444";
      case "warning": return "#f59e0b";
      default: return "#6b7280";
    }
  };
  const getLevelColor = (level) => (level >= 80 ? "#10b981" : level >= 40 ? "#f59e0b" : "#ef4444");

  return (
    <div className="homepage-container">
      <WaterThemeStyles />

      <Nav onProfileClick={() => setShowProfileModal(true)} profilePicUrl={profilePicUrl} />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div>
            <h1 className="hero-title">Welcome back, <span className="hero-tank-id">{tankId}</span></h1>
            <p className="hero-subtitle">Monitor your Neptune smart water system in real-time</p>
          </div>
          <div className="hero-visual">
            {tankDetails && <TankImage capacity={tankDetails.capacity} />}
          </div>
        </div>
        <div className="hero-actions">
          <button className="hero-btn primary" onClick={() => setShowUpgradeModal(true)}>🚀 Upgrade Your Tank</button>
          <Link to="/issues/new" className="hero-btn secondary">🧹 Request Cleanup</Link>
        </div>
      </section>

      {/* Dashboard */}
      <main className="dashboard-grid">
        <Link to={"/client/water-level"} className="dashboard-card water-level">
          <div className="card-header"><div className="card-icon">💧</div><h3>Water Level</h3></div>
          <div className="card-content">
            <div className="metric-value" style={{ color: getLevelColor(currentLevel) }}>{loading ? "..." : `${currentLevel}%`}</div>
            <div className="level-bar"><div className="level-fill" style={{ width: `${currentLevel}%`, backgroundColor: getLevelColor(currentLevel) }} /></div>
          </div>
        </Link>

        <Link to="/client/billing" className="dashboard-card billing">
          <div className="card-header"><div className="card-icon">💰</div><h3>Current Bill</h3></div>
          <div className="card-content">
            <div className="metric-value">{loading ? "..." : `Rs ${currentBill.toFixed(2)}`}</div>
            <div className="metric-subtitle">This month</div>
          </div>
        </Link>

        <Link to={"/client/water-quality"} className="dashboard-card water-quality">
          <div className="card-header"><div className="card-icon">🧪</div><h3>Water Quality</h3></div>
          <div className="card-content">
            <div className="status-indicator">
              <div className="status-dot" style={{ backgroundColor: getStatusColor(currentStatus) }} />
              <span className="status-text">{loading ? "Loading..." : currentStatus}</span>
            </div>
          </div>
        </Link>

        <div className="dashboard-card issues">
          <div className="card-header"><div className="card-icon">⚠️</div><h3>Recent Issues</h3></div>
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
                {issues.length > 3 && <Link to="/issues" className="view-all-link">View all {issues.length} issues →</Link>}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-icon">✅</div><p>All systems running smoothly</p></div>
            )}
          </div>
        </div>
      </main>

      {/* Registered Tanks */}
      <section className="registered-tanks-section">
        <div className="section-header">
          <h2 className="section-title">🏢 Registered Tanks Network</h2>
          <p className="section-subtitle">Connected smart water systems in your area</p>
        </div>
        <div className="tanks-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="tank-card loading"><div className="tank-skeleton" /></div>
            ))
          ) : (
            registeredTanks.map((tank, idx) => (
              <div key={idx} className="tank-card">
                <div className="tank-header">
                  <TankImage capacity={tank.capacity || 1000} />
                  <div className="tank-status online" />
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
        
        {/* Important System Information Section */}
        <div className="system-info-section" style={{
          marginTop: "32px",
          padding: "24px",
          background: "linear-gradient(180deg, rgba(15,23,42,.8), rgba(15,23,42,.6))",
          border: "1px solid rgba(145,177,208,.2)",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,.35)"
        }}>
          <div className="info-header" style={{
            textAlign: "center",
            marginBottom: "24px"
          }}>
            <h3 style={{
              margin: "0 0 8px",
              fontSize: "24px",
              fontWeight: "900",
              color: "#e7f7ff",
              textShadow: "0 4px 12px rgba(0,0,0,.3)"
            }}>
              🌊 Neptune Smart Water Management System
            </h3>
            <p style={{
              margin: "0",
              color: "#a9c4e0",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Revolutionizing Water Management with Advanced Technology
            </p>
          </div>
          
          <div className="info-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "24px"
          }}>
            <div className="info-card" style={{
              padding: "20px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(145,177,208,.15)",
              borderRadius: "12px",
              borderLeft: "4px solid #22d3ee"
            }}>
              <h4 style={{
                margin: "0 0 12px",
                color: "#22d3ee",
                fontSize: "18px",
                fontWeight: "800"
              }}>
                🔍 Real-Time Monitoring
              </h4>
              <p style={{
                margin: "0",
                color: "#dff7ff",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                Our advanced sensors continuously monitor water levels, quality parameters (pH, TDS), and system health. 
                Get instant alerts when your tank needs attention or when water quality issues are detected.
              </p>
            </div>
            
            <div className="info-card" style={{
              padding: "20px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(145,177,208,.15)",
              borderRadius: "12px",
              borderLeft: "4px solid #10b981"
            }}>
              <h4 style={{
                margin: "0 0 12px",
                color: "#10b981",
                fontSize: "18px",
                fontWeight: "800"
              }}>
                📊 Smart Analytics
              </h4>
              <p style={{
                margin: "0",
                color: "#dff7ff",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                Advanced analytics help you understand water usage patterns, predict maintenance needs, and optimize 
                your water consumption. Track trends and make data-driven decisions for better water management.
              </p>
            </div>
            
            <div className="info-card" style={{
              padding: "20px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(145,177,208,.15)",
              borderRadius: "12px",
              borderLeft: "4px solid #f59e0b"
            }}>
              <h4 style={{
                margin: "0 0 12px",
                color: "#f59e0b",
                fontSize: "18px",
                fontWeight: "800"
              }}>
                🚨 Proactive Alerts
              </h4>
              <p style={{
                margin: "0",
                color: "#dff7ff",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                Never run out of water again! Our system sends smart notifications via email and SMS when water levels 
                are low, quality issues are detected, or maintenance is required. Stay informed 24/7.
              </p>
            </div>
            
            <div className="info-card" style={{
              padding: "20px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(145,177,208,.15)",
              borderRadius: "12px",
              borderLeft: "4px solid #8b5cf6"
            }}>
              <h4 style={{
                margin: "0 0 12px",
                color: "#8b5cf6",
                fontSize: "18px",
                fontWeight: "800"
              }}>
                💰 Cost Optimization
              </h4>
              <p style={{
                margin: "0",
                color: "#dff7ff",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                Track your water usage and billing in real-time. Our system helps you identify leaks, optimize 
                consumption, and reduce costs. Get detailed reports and insights to make informed decisions.
              </p>
            </div>
          </div>
          
          <div className="info-footer" style={{
            textAlign: "center",
            padding: "20px",
            background: "rgba(34,211,238,.08)",
            border: "1px solid rgba(34,211,238,.2)",
            borderRadius: "12px"
          }}>
            <h4 style={{
              margin: "0 0 8px",
              color: "#22d3ee",
              fontSize: "18px",
              fontWeight: "800"
            }}>
              🌟 Why Choose Neptune?
            </h4>
            <p style={{
              margin: "0",
              color: "#dff7ff",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              Neptune combines cutting-edge IoT technology with user-friendly interfaces to provide the most comprehensive 
              water management solution. Our system is trusted by thousands of customers worldwide and continues to evolve 
              with the latest innovations in smart water technology.
            </p>
          </div>
        </div>
      </section>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} tankDetails={tankDetails} profilePicUrl={profilePicUrl} setProfilePicUrl={setProfilePicUrl} />
      <Footer />
    </div>
  );
}
