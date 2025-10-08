import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";

function TankNav() {
  const { tankId } = useParams();
  const location = useLocation();

  // helper to check active link
  const isActive = (to) => location.pathname === to;

  const styles = {
    root: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background:
        "linear-gradient(180deg, #f97316 0%, #fb923c 100%)", // orange gradient
      borderBottom: "1px solid rgba(255,255,255,.15)",
      boxShadow: "0 8px 24px rgba(0,0,0,.18)",
    },
    inner: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      justifyContent: "space-between",
      padding: "12px 16px",
      maxWidth: 1300,
      margin: "0 auto",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "#0b1020",
      fontWeight: 900,
      letterSpacing: ".2px",
    },
    brandKick: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 0 0 4px rgba(255,255,255,.28)",
    },
    tankPill: {
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: "rgba(0,0,0,.15)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,.25)",
    },
    // horizontal scroller for links (scrollbar hidden by <style> below)
    linksWrap: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      overflowX: "auto",
      gap: 8,
    },
    linkBase: {
      color: "#fff",
      textDecoration: "none",
      fontWeight: 800,
      fontSize: 14,
      borderRadius: 999,
      padding: "10px 14px",
      border: "1px solid rgba(0,0,0,.25)",
      background: "rgba(0,0,0,.18)",
      boxShadow: "0 6px 16px rgba(0,0,0,.12)",
      whiteSpace: "nowrap",
      transition: "transform .15s ease, box-shadow .15s ease, border-color .15s",
    },
    linkActive: {
      background: "rgba(255,255,255,.18)",
      border: "1px solid rgba(255,255,255,.45)",
      boxShadow: "0 10px 24px rgba(0,0,0,.18), 0 0 0 3px rgba(255,255,255,.18) inset",
      color: "#0b1020",
    },
  };

  return (
    <>
      {/* tiny CSS to hide scrollbar on the horizontal link row */}
      <style>{`
        .tank-subnav {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none;   /* Firefox */
        }
        .tank-subnav::-webkit-scrollbar { display: none; } /* Chrome/Safari */
      `}</style>

      <nav style={styles.root}>
        <div style={styles.inner}>
          <div style={styles.brand}>
            <span style={styles.brandKick} />
            <span>Neptune • Tank</span>
            {tankId && <span style={styles.tankPill}>{tankId}</span>}
          </div>

          <div className="tank-subnav" style={styles.linksWrap}>
            <Link
              to={`/tank/${tankId}/dashboard`}
              style={{
                ...styles.linkBase,
                ...(isActive(`/tank/${tankId}/dashboard`) ? styles.linkActive : {}),
              }}
            >
              Tank Dashboard
            </Link>
            <Link
              to={`/tank/${tankId}/water-quality`}
              style={{
                ...styles.linkBase,
                ...(isActive(`/tank/${tankId}/water-quality`) ? styles.linkActive : {}),
              }}
            >
              Water Quality
            </Link>
            <Link
              to={`/tank/${tankId}/tank-level`}
              style={{
                ...styles.linkBase,
                ...(isActive(`/tank/${tankId}/tank-level`) ? styles.linkActive : {}),
              }}
            >
              Tank Level
            </Link>
            <Link
              to={`/admin/issues/${tankId}`}
              style={{
                ...styles.linkBase,
                ...(isActive(`/admin/issues/${tankId}`) ? styles.linkActive : {}),
              }}
            >
              Issue Reports
            </Link>
            <Link
              to={`/tank/${tankId}/billing`}
              style={{
                ...styles.linkBase,
                ...(isActive(`/tank/${tankId}/billing`) ? styles.linkActive : {}),
              }}
            >
              Billing
            </Link>
            <Link
              to="/sellers"
              style={{
                ...styles.linkBase,
                ...(isActive(`/sellers`) ? styles.linkActive : {}),
              }}
            >
              Home
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default TankNav;
