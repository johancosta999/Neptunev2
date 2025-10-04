import { bottomNavigationActionClasses } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function AdminNav() {   // ✅ Capitalized
  const notifPanelRef = useRef(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchOpenIssues = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/issues/open');
        const list = (res.data || []).map(i => ({
          id: i._id,
          text: `New issue: ${i.title} - ${i.tankId}`,
          time: new Date(i.createdAt).toLocaleTimeString(),
          tankId: i.tankId,
        }));
        setNotifications(list);
        setUnread(list.length);
      } catch (e) { console.error(e); }
    };
    fetchOpenIssues();
    const interval = setInterval(fetchOpenIssues, 15000);
    return () => clearInterval(interval);
  }, []);

  // Click-away listener for notification panel
  useEffect(() => {
    if (!isNotifOpen) return;
    function handleClickOutside(event) {
      if (notifPanelRef.current && !notifPanelRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);
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
            {unread > 0 && <span style={styles.badge}>{unread}</span>}
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>

          {isNotifOpen && (
            <div style={styles.panel} ref={notifPanelRef}>
              <div style={styles.panelHeader}>
                <strong>Notifications</strong>
                <button
                  onClick={() => { setUnread(0); setIsNotifOpen(false); }}
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
                    <div key={n.id} style={styles.panelItem} onClick={() => navigate(`/admin/issues/${n.tankId}`)}>
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
