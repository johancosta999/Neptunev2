// src/Component/Seller/Tanks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNav from "../Nav/adminNav";

function Tanks() {
  const [records, setRecords] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orange admin palette
  const ACCENT = {
    main: "#f97316", // orange-500
    soft: "#fb923c",
    glow: "rgba(251,146,60,.25)",
    pill: "rgba(251,146,60,.12)",
    textOn: "#0f172a",
  };

  const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

  const cities = useMemo(
    () => [
      "Colombo",
      "Negombo",
      "Kurunegala",
      "Ja-Ela",
      "Kandy",
      "Galle",
      "Matara",
      "Anuradhapura",
      "Jaffna",
      "Trincomalee",
    ],
    []
  );

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sellers");
      const data = res.data?.data || [];
      setRecords(data);
      setFilteredRecords(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let list = records;
    if (searchId.trim()) {
      const q = searchId.toLowerCase();
      list = list.filter((t) => t.tankId?.toLowerCase().includes(q));
    }
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter((t) => t.customerName?.toLowerCase().includes(q));
    }
    if (filterCity) {
      list = list.filter(
        (t) => (t.city || "").toLowerCase() === filterCity.toLowerCase()
      );
    }
    setFilteredRecords(list);
  }, [searchId, searchName, filterCity, records]);

  const deleteTank = async (mongoId) => {
    if (!window.confirm("Are you sure you want to delete this tank?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/sellers/${mongoId}`);
      setRecords((prev) => prev.filter((t) => t._id !== mongoId));
    } catch (err) {
      console.log(err);
      alert("Failed to delete tank.");
    }
  };

  /* -------------------- Styles (full-bleed) -------------------- */
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      padding: "0 16px 16px",
      backgroundImage: `
        radial-gradient(900px 480px at 15% -10%, ${ACCENT.glow}, transparent 60%),
        radial-gradient(900px 480px at 110% 10%, rgba(234,88,12,.18), transparent 60%),
        linear-gradient(135deg, #0b1020 0%, #0d1519 35%, #101826 100%)
      `,
      overflowX: "hidden",
    },

    container: { width: "100%", margin: "0 auto" },

    headerCard: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: 16,
      padding: "14px 16px",
      marginTop: 12,
      marginBottom: 16,
      color: "#e5e7eb",
      width: "100%",
    },
    headerRow: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    title: {
      margin: 0,
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: ".2px",
      color: "#f8fafc",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    toolbar: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      width: "100%",
    },
    input: {
      flex: "1 1 320px",
      maxWidth: "520px",
      height: 42,
      padding: "0 12px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,.25)",
      background: "rgba(2,6,23,.6)",
      color: "#f8fafc",
      outline: "none",
    },
    select: {
      flex: "0 0 220px",
      height: 42,
      padding: "0 12px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,.25)",
      background: "rgba(2,6,23,.6)",
      color: "#f8fafc",
      outline: "none",
    },

    grid: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: 16,
    },
    card: {
      background: "rgba(17,24,39,0.68)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      padding: 14,
      color: "#e5e7eb",
      boxShadow: "0 18px 40px rgba(0,0,0,.30)",
      transition: "transform .25s ease, box-shadow .25s ease, border-color .25s",
    },
    cardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      borderColor: "rgba(234,88,12,.35)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    tankId: {
      margin: 0,
      fontSize: 16,
      fontWeight: 900,
      color: "#f8fafc",
    },
    badge: {
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      background: ACCENT.pill,
      color: "#fed7aa",
      border: `1px solid ${ACCENT.glow}`,
    },
    label: { fontSize: 12, color: "#9aa3b2" },
    value: { fontSize: 14, fontWeight: 700, color: "#e5e7eb" },
    row: { display: "grid", gridTemplateColumns: "1fr", gap: 2, marginTop: 2 },
    actions: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
    primaryBtn: {
      height: 40,
      padding: "0 12px",
      borderRadius: 10,
      border: "none",
      fontWeight: 900,
      color: ACCENT.textOn,
      background: `linear-gradient(135deg, ${ACCENT.main}, ${ACCENT.soft})`,
      boxShadow: "0 12px 24px rgba(249,115,22,.28)",
      cursor: "pointer",
    },
    dangerBtn: {
      height: 40,
      padding: "0 12px",
      borderRadius: 10,
      border: "1px solid rgba(239,68,68,.35)",
      background: "rgba(239,68,68,.12)",
      color: "#fecaca",
      fontWeight: 900,
      cursor: "pointer",
    },
    empty: {
      gridColumn: "1 / -1",
      textAlign: "center",
      color: "#9aa3b2",
      background: "rgba(17,24,39,.6)",
      border: "1px dashed rgba(148,163,184,.25)",
      borderRadius: 14,
      padding: 48,
    },
  };

  return (
    <div style={styles.page}>
      {/* Global reset to remove the white border & hide scrollbars */}
      <style>{`
        html, body, #root { height: 100%; width: 100%; }
        body { margin: 0 !important; background: transparent; }
        * { box-sizing: border-box; }
        /* hide scrollbar */
        ::-webkit-scrollbar { width: 0; height: 0 }
        * { scrollbar-width: none; }
        tr:hover td { background: rgba(2,6,23,.35); transition: background .2s ease; }
      `}</style>

      <AdminNav />

      <div style={styles.container}>
        {/* Header / Filters */}
        <div style={styles.headerCard}>
          <div style={styles.headerRow}>
            <h1 style={styles.title}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: ACCENT.main,
                  boxShadow: `0 0 0 4px ${ACCENT.pill}`,
                }}
              />
              Tanks
            </h1>
            <div style={styles.toolbar}>
              <input
                style={styles.input}
                placeholder="Search by Tank ID…"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Search by Customer Name…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <select
                style={styles.select}
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div style={styles.grid}>
          {loading ? (
            <div style={styles.empty}>Loading tanks…</div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((tank) => {
              const dateStr = tank.sellDate
                ? new Date(tank.sellDate).toLocaleDateString()
                : "—";
              return (
                <Card key={tank._id || tank.tankId} styles={styles}>
                  <div style={styles.cardHeader}>
                    <h2 style={styles.tankId}>{tank.tankId}</h2>
                    <span style={styles.badge}>{tank.city || "—"}</span>
                  </div>

                  <Field label="Customer" value={tank.customerName} styles={styles} />
                  <Field label="Address" value={tank.address} styles={styles} />
                  <Field label="Email" value={tank.customerEmail} styles={styles} />
                  <Field label="Contact" value={tank.contactNumber} styles={styles} />
                  <Field label="Capacity" value={`${tank.capacity || "—"} L`} styles={styles} />
                  <Field label="Price" value={money(tank.price)} styles={styles} />
                  <Field
                    label="Warranty"
                    value={tank.warranty ? `${tank.warranty} years` : "—"}
                    styles={styles}
                  />
                  <Field label="Invoice" value={tank.invoiceNumber} styles={styles} />
                  <Field label="Sold" value={dateStr} styles={styles} />

                  <div style={styles.actions}>
                    <Link to={`/tank/${tank.tankId}/dashboard`}>
                      <button style={styles.primaryBtn}>View Details</button>
                    </Link>
                    <button
                      style={styles.dangerBtn}
                      onClick={() => deleteTank(tank._id)}
                    >
                      Delete Tank
                    </button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div style={styles.empty}>No tanks found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, value, styles }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value || "—"}</span>
    </div>
  );
}

function Card({ styles, children }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ ...styles.card, ...(hover ? styles.cardHover : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </div>
  );
}

export default Tanks;
