// src/Component/Nav/adminNav.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminNav() {
  const notifPanelRef = useRef(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenIssues = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/issues/open");
        const list = (res.data || []).map((i) => ({
          id: i._id,
          text: `New issue: ${i.title} - ${i.tankId}`,
          time: new Date(i.createdAt).toLocaleTimeString(),
          tankId: i.tankId,
        }));
        setNotifications(list);
        setUnread(list.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchOpenIssues();
    const interval = setInterval(fetchOpenIssues, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isNotifOpen) return;
    const onAway = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onAway);
    return () => document.removeEventListener("mousedown", onAway);
  }, [isNotifOpen]);

  const styles = {
    navWrap: { position: "sticky", top: 0, zIndex: 50 },
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 24px",
      background:
        "linear-gradient(180deg, #f97316 0%, #ef6a12 60%, #e65f0e 100%)",
      color: "#fff",
      width: "100%",
      boxShadow: "0 8px 24px rgba(0,0,0,.25)",
    },
    ul: { display: "flex", gap: 16, listStyle: "none", margin: 0, padding: 0 },
    link: {
      color: "#fff",
      textDecoration: "none",
      fontWeight: 700,
      padding: "8px 14px",
      borderRadius: 999,
      background: "rgba(0,0,0,.15)",
      border: "1px solid rgba(255,255,255,.25)",
    },
    right: { display: "flex", alignItems: "center", gap: 12, position: "relative" },
    bellBtn: {
      background: "rgba(0,0,0,.15)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,.25)",
      borderRadius: 10,
      padding: "6px 10px",
      cursor: "pointer",
      fontWeight: 700,
    },
    badge: {
      marginLeft: 6,
      backgroundColor: "#ef4444",
      color: "#fff",
      borderRadius: 999,
      padding: "2px 6px",
      fontSize: 12,
      fontWeight: 800,
    },
    logoutBtn: {
      background: "#111827",
      color: "#fff",
      border: "1px solid rgba(255,255,255,.25)",
      borderRadius: 10,
      padding: "8px 12px",
      cursor: "pointer",
      fontWeight: 800,
    },
    panel: {
      position: "absolute",
      top: 52,
      right: 0,
      width: 320,
      background: "#0b1020",
      color: "#e5e7eb",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 14,
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      overflow: "hidden",
    },
    panelHeader: {
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,.08)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "rgba(255,255,255,.02)",
    },
    panelList: { maxHeight: 260, overflowY: "auto" },
    panelItem: {
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,.06)",
      cursor: "pointer",
    },
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } catch {}
    navigate("/login");
  };

  return (
    <>
      {/* 🔧 Global reset — removes white border and hides scrollbars on ALL pages that render AdminNav */}
      <style>{`
        html, body, #root { height: 100%; width: 100%; }
        body { margin: 0 !important; background: transparent; }
        * { box-sizing: border-box; }
        /* hide scrollbars */
        ::-webkit-scrollbar { width: 0; height: 0; }
        * { scrollbar-width: none; }
      `}</style>

      <div style={styles.navWrap}>
        <nav style={styles.nav}>
          <ul style={styles.ul}>
            <li><Link style={styles.link} to="/sellers">Tanks</Link></li>
            <li><Link style={styles.link} to="/staffs">Staff</Link></li>
          </ul>

          <div style={styles.right}>
            <button
              aria-label="Notifications"
              onClick={() => setIsNotifOpen((v) => !v)}
              style={styles.bellBtn}
            >
              🔔{unread > 0 && <span style={styles.badge}>{unread}</span>}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>

            {isNotifOpen && (
              <div style={styles.panel} ref={notifPanelRef}>
                <div style={styles.panelHeader}>
                  <strong>Notifications</strong>
                  <button
                    onClick={() => { setUnread(0); setIsNotifOpen(false); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fb923c",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <div style={styles.panelList}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 12, color: "#9aa3b2" }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={styles.panelItem}
                        onClick={() => navigate(`/admin/issues/${n.tankId}`)}
                      >
                        <div style={{ fontWeight: 700 }}>{n.text}</div>
                        <div style={{ color: "#9aa3b2", fontSize: 12 }}>{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
