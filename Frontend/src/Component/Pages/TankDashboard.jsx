import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "../Nav/nav";
import axios from "axios";

function TankDashboard() {
  const { tankId } = useParams();
  const [tankDetails, setTankDetails] = useState(null); // to hold the fetched tank details
  const [loading, setLoading] = useState(true);

  // 🎨 Professional UI styles
  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6", minHeight: "100vh" },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      maxWidth: "1100px",
      margin: "0 auto",
      overflow: "hidden",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    },
    title: { fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 },
    body: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0", alignItems: "stretch" },
    left: { padding: "20px" },
    right: { padding: "20px", borderLeft: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" },
    heroImage: { maxWidth: "75%", height: "auto", objectFit: "contain" },
    section: { marginBottom: "14px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    field: { display: "flex", flexDirection: "column", gap: "4px" },
    label: { fontSize: "12px", color: "#6b7280" },
    value: { fontSize: "14px", color: "#111827", fontWeight: 600 },
    badgeRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" },
    badge: { padding: "4px 8px", borderRadius: "9999px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: 700 },
    subtle: { color: "#6b7280" },
    loading: { maxWidth: "900px", margin: "40px auto", textAlign: "center", color: "#6b7280" },
    notFound: { maxWidth: "900px", margin: "40px auto", textAlign: "center", color: "#b91c1c" },
  };

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
        setTankDetails(res.data); // assuming you return single tank object from API
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tank details:", err);
        setLoading(false);
      }
    };

    fetchTankDetails();
  }, [tankId]);

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading tank data...
      </div>
    );
  }

  if (!tankDetails) {
    return (
      <div style={styles.notFound}>
        ❌ Tank not found for ID: {tankId}
      </div>
    );
  }

  const brand = getBrandByCapacity(tankDetails.capacity);

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tank Dashboard - {tankId}</h2>
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
                  <span style={styles.value}>{tankDetails.price ? `Rs. ${tankDetails.price}` : "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Warranty</span>
                  <span style={styles.value}>{tankDetails.warranty ? `${tankDetails.warranty} years` : "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>NIC</span>
                  <span style={styles.value}>{tankDetails.nicNumber || "-"}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.label}>Description</span>
                  <span style={{ ...styles.value, fontWeight: 500 }} className="description">{tankDetails.description || <span style={styles.subtle}>No description</span>}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.right}>
            <img src={brand.image} alt={`${brand.name} brand`} style={styles.heroImage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TankDashboard;
