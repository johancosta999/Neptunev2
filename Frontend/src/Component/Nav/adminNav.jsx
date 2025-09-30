import { bottomNavigationActionClasses } from '@mui/material';
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";

function AdminNav() {   // ✅ Capitalized
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New tank registered', time: 'Just now' },
    { id: 2, text: 'Low water level alert - TANK-102', time: '10m ago' },
    { id: 3, text: 'Staff profile updated', time: '1h ago' },
  ]);
  const navigate = useNavigate();

  const styles = {
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 50px',
      backgroundColor: '#111827',
      color: '#fff',
      position: 'relative',
      marginBottom: '30px',   // ✅ adds space below navbar everywhere
    },
    ul: { display: 'flex', gap: 16, listStyle: 'none', margin: 0, padding: 0 },
    link: { color: '#fff', textDecoration: 'none', fontWeight: 600 },
    right: { display: 'flex', alignItems: 'center', gap: 12, position: 'relative' },
    bellBtn: { background: 'transparent', color: '#fff', border: '1px solid #374151', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' },
    badge: { marginLeft: 6, backgroundColor: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '2px 6px', fontSize: 12, fontWeight: 700 },
    panel: { position: 'absolute', top: 48, right: 16, width: 320, background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 10px 20px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 30 },
    panelHeader: { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    panelList: { maxHeight: 260, overflowY: 'auto' },
    panelItem: { padding: '10px 12px', borderBottom: '1px solid #f3f4f6' },
    logoutBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 },
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (e) {}
    navigate('/login');
  };

  return (
    <div>
      <nav className='admin-nav' style={styles.nav}>
        <ul style={styles.ul}>
            <li>
                <Link style={styles.link} to="/sellers">Tanks</Link>
            </li>
            <li>
                <Link style={styles.link} to="/staffs">Staff</Link>
            </li>
        </ul>

        <div style={styles.right}>
          <button
            aria-label="Notifications"
            onClick={() => setIsNotifOpen((v) => !v)}
            style={styles.bellBtn}
          >
            🔔
            {notifications.length > 0 && <span style={styles.badge}>{notifications.length}</span>}
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>

          {isNotifOpen && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <strong>Notifications</strong>
                <button
                  onClick={() => { setNotifications([]); setIsNotifOpen(false); }}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              </div>
              <div style={styles.panelList}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 12, color: '#6b7280' }}>No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={styles.panelItem}>
                      <div style={{ fontWeight: 600 }}>{n.text}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
};

export default AdminNav;   // ✅ Also uppercase here
