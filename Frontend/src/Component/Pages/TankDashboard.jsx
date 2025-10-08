import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import axios from "axios";

/* 🔧 Removes the top white strip, hides scrollbars visually,
   gives a dark animated background and makes nav full width. */
function EdgeFlushFix() {
  useEffect(() => {
    const id = "edge-flush-fix";
    if (document.getElementById(id)) return;

    const css = `
:root{
  --nav-orange:#f97316;
  --bg-deep:#07131b;
  --bg-deeper:#0b1b26;
  --ring: rgba(249,115,22,.18);
}

/* Remove default page margin (fixes the white strip) */
html, body, #root { height: 100%; }
body {
  margin: 0;
  background: var(--bg-deep);
  color-scheme: dark;
  overflow-x: hidden;
}

/* Global animated water glow */
#root::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(1200px 800px at 10% -10%, rgba(255,255,255,0.04), transparent 60%),
    radial-gradient(1200px 800px at 110% 0%, rgba(56,189,248,0.06), transparent 60%),
    linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-deeper) 100%);
  z-index: -3;
}
body::before {
  content: "";
  position: fixed;
  inset: -20vmax;
  background:
    radial-gradient(40vmax 30vmax at 20% 10%, rgba(0,212,255,.16), transparent 60%),
    radial-gradient(50vmax 35vmax at 80% 20%, rgba(59,130,246,.14), transparent 65%),
    conic-gradient(from 180deg at 50% 120%, rgba(56,189,248,.10), transparent 70%);
  filter: blur(38px) saturate(120%);
  animation: waterFloat 28s linear infinite alternate;
  z-index: -2;
}
@keyframes waterFloat {
  to { transform: translate3d(2vw,-1vh,0) scale(1.03); }
}

/* Hide scrollbars (visual only) */
::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
::-webkit-scrollbar-thumb { background: transparent; }
* { scrollbar-width: none; } /* Firefox */

/* Make top navs span full width cleanly */
.admin-nav, .tank-nav, nav {
  width: 100% !important;
  margin: 0 !important;
  left: 0; right: 0;
}

/* Optional soft ring under nav on dark backgrounds */
.admin-nav, .tank-nav {
  box-shadow: 0 8px 24px var(--ring);
}
    `;

    const s = document.createElement("style");
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);

    return () => {
      try { document.head.removeChild(s); } catch (_) {}
    };
  }, []);

  return null;
}

function TankDashboard() {
  const { tankId } = useParams();
  const [tankDetails, setTankDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎨 Polished dark UI
  const styles = {
    page: { padding: "24px", backgroundColor: "transparent", minHeight: "100vh" },
    card: {
      backgroundColor: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      boxShadow: "0 12px 32px rgba(0,0,0,.35)",
      maxWidth: "1200px",
      margin: "0 auto",
      overflow: "hidden",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
      color: "#e5e7eb",
    },
    title: { fontSize: "20px", fontWeight: 800, margin: 0 },
    body: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: 0,
      alignItems: "stretch",
    },
    left: { padding: "20px", color: "#e5e7eb" },
    right: {
      padding: "20px",
      borderLeft: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(2,6,23,.5)",
    },
    heroWrap: {
      position: "relative",
      display: "grid",
      placeItems: "center",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },
    heroImage: {
      maxWidth: "82%",
      height: "auto",
      objectFit: "contain",
      animation: "floatY 7s ease-in-out infinite",
      filter: "drop-shadow(0 20px 40px rgba(0,0,0,.45))",
    },
    section: { marginBottom: "14px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    field: { display: "flex", flexDirection: "column", gap: "4px" },
    label: { fontSize: "12px", color: "#9aa3b2" },
    value: { fontSize: "14px", color: "#e5e7eb", fontWeight: 700 },
    badgeRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" },
    badge: {
      padding: "4px 8px",
      borderRadius: "9999px",
      backgroundColor: "rgba(30,58,138,.35)",
      color: "#c7d2fe",
      fontSize: "12px",
      fontWeight: 800,
      border: "1px solid rgba(99,102,241,.28)",
    },
    subtle: { color: "#9aa3b2" },
    loading: { maxWidth: "900px", margin: "40px auto", textAlign: "center", color: "#9aa3b2" },
    notFound: { maxWidth: "900px", margin: "40px auto", textAlign: "center", color: "#fecaca" },
  };

  // local keyframes for the image float
  useEffect(() => {
    const id = "floatY-keyframes";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
@keyframes floatY {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}`;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch (_) {} };
  }, []);

  // 🖼️ Determine brand by capacity
  const getBrandByCapacity = (capacityRaw) => {
    if (!capacityRaw) return { name: "Neptune", image: "/Neptune.png" };
    const capacity = parseInt(String(capacityRaw).replace(/[^0-9]/g, ""), 10);
    if (Number.isNaN(capacity)) return { name: "Neptune", image: "/Neptune.png" };
    if (capacity <= 350) return { name: "Aqualite", image: "/aqualite.png" };
    if (capacity <= 750) return { name: "BlueWave", image: "/bluewave.png" };
    if (capacity <= 1000) return { name: "Hydromax", image: "/hydromax.png" };
    return { name: "Neptune", image: "/Neptune.png" };
  };

  useEffect(() => {
    const fetchTankDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sellers/${tankId}`);
        setTankDetails(res.data);
      } catch (err) {
        console.error("Error fetching tank details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTankDetails();
  }, [tankId]);

  if (loading) return <div style={styles.loading}>Loading tank data…</div>;
  if (!tankDetails) return <div style={styles.notFound}>❌ Tank not found for ID: {tankId}</div>;

  const brand = getBrandByCapacity(tankDetails.capacity);

  return (
    <div style={styles.page}>
      {/* ✅ Fix white strip + background for this page */}
      <EdgeFlushFix />

      <Nav />

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tank Dashboard — {tankId}</h2>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>{brand.name}</span>
            {tankDetails.city && <span style={styles.badge}>{tankDetails.city}</span>}
            {tankDetails.capacity && <span style={styles.badge}>{tankDetails.capacity}</span>}
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.left}>
            <div style={styles.section}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <span style={styles.label}>Customer Name</span>
                  <span style={styles.value}>{tankDetails.customerName || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Contact</span>
                  <span style={styles.value}>{tankDetails.contactNumber || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{tankDetails.customerEmail || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Address</span>
                  <span style={styles.value}>{tankDetails.address || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Invoice</span>
                  <span style={styles.value}>{tankDetails.invoiceNumber || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Sold On</span>
                  <span style={styles.value}>{tankDetails.sellDate || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Price</span>
                  <span style={styles.value}>
                    {tankDetails.price ? `Rs. ${tankDetails.price}` : "-"}
                  </span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Warranty</span>
                  <span style={styles.value}>
                    {tankDetails.warranty ? `${tankDetails.warranty} years` : "-"}
                  </span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>NIC</span>
                  <span style={styles.value}>{tankDetails.nicNumber || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Description</span>
                  <span style={{ ...styles.value, fontWeight: 500 }}>
                    {tankDetails.description || <span style={styles.subtle}>No description</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.right}>
            <div style={styles.heroWrap}>
              <img
                src={brand.image}
                alt={`${brand.name} brand`}
                style={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TankDashboard;
