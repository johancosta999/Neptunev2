import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Seller/tanks.css"; 
import AdminNav from "../Nav/adminNav";

function Tanks() {
  const [records, setRecords] = useState([]);
  const [searchId, setSearchId] = useState("");   // search by tank ID
  const [searchName, setSearchName] = useState(""); // search by customer name
  const [filterCity, setFilterCity] = useState(""); // filter by city
  const [filteredRecords, setFilteredRecords] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sellers");
      const data = res.data.data || [];
      setRecords(data);
      setFilteredRecords(data); // initial filter is all records
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Apply filters whenever searchId, searchName, filterCity, or records change
  useEffect(() => {
    let filtered = records;

    if (searchId) {
      filtered = filtered.filter((tank) =>
        tank.tankId?.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    if (searchName) {
      filtered = filtered.filter((tank) =>
        tank.customerName?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterCity) {
      filtered = filtered.filter(
        (tank) => tank.city?.toLowerCase() === filterCity.toLowerCase()
      );
    }

    setFilteredRecords(filtered);
  }, [searchId, searchName, filterCity, records]);

  // ✅ Delete tank function
  const deleteTank = async (tankId) => {
    if (window.confirm("Are you sure you want to delete this tank?")) {
      try {
        await axios.delete(`http://localhost:5000/api/sellers/${tankId}`);
        const updatedRecords = records.filter((tank) => tank._id !== tankId);
        setRecords(updatedRecords);
      } catch (err) {
        console.log(err);
        alert("Failed to delete tank.");
      }
    }
  };

  // 🔹 City options for dropdown
  const cities = [
    "Colombo", "Negombo", "Kurunegala", "Ja-Ela",
    "Kandy", "Galle", "Matara", "Anuradhapura", "Jaffna", "Trincomalee"
  ];

  // 🎨 Professional UI styles
  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6", minHeight: "100vh" },
    headerCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      padding: "16px 20px",
      marginBottom: "16px",
    },
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" },
    title: { fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 },
    toolbar: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
    input: { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#ffffff", minWidth: "220px" },
    select: { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "#ffffff", minWidth: "180px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" },
    tankId: { fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: 0 },
    badge: { padding: "4px 8px", borderRadius: "9999px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: 700 },
    fieldRow: { display: "grid", gridTemplateColumns: "1fr", gap: "2px" },
    label: { fontSize: "12px", color: "#6b7280" },
    value: { fontSize: "14px", color: "#111827", fontWeight: 600 },
    actions: { display: "flex", gap: "8px", marginTop: "8px" },
    primaryBtn: { padding: "8px 12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    dangerBtn: { padding: "8px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    empty: { textAlign: "center", padding: "48px", color: "#6b7280", backgroundColor: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: "12px" },
  };

  return (
    <div style={styles.page}>
      <AdminNav />

      <div style={styles.headerCard}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Tanks</h1>
          <div style={styles.toolbar}>
            <input
              type="text"
              placeholder="Search by Tank ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Search by Customer Name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={styles.input}
            />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              style={styles.select}
            >
              <option value="">All Cities</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>{city}</option>
              ))}
            </select>
            
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((tank, i) => (
            <div style={styles.card} key={i}>
              <div style={styles.cardHeader}>
                <h2 style={styles.tankId}>{tank.tankId}</h2>
                <span style={styles.badge}>{tank.city || "N/A"}</span>
              </div>

              <div style={styles.fieldRow}>
                <span style={styles.label}>Customer</span>
                <span style={styles.value}>{tank.customerName || "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Address</span>
                <span style={styles.value}>{tank.address || "-"}</span>
              </div>
              0
              <div style={styles.fieldRow}>
                <span style={styles.label}>Email</span>
                <span style={styles.value}>{tank.customerEmail || "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Contact</span>
                <span style={styles.value}>{tank.contactNumber || "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Capacity</span>
                <span style={styles.value}>{tank.capacity || "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Price</span>
                <span style={styles.value}>{tank.price ? `Rs. ${tank.price}` : "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Warranty</span>
                <span style={styles.value}>{tank.warranty ? `${tank.warranty} years` : "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Invoice</span>
                <span style={styles.value}>{tank.invoiceNumber || "-"}</span>
              </div>
              <div style={styles.fieldRow}>
                <span style={styles.label}>Sold</span>
                <span style={styles.value}>{tank.sellDate || "-"}</span>
              </div>

              <div style={styles.actions}>
                <Link to={`/tank/${tank.tankId}/dashboard`}>
                  <button style={styles.primaryBtn}>View Details</button>
                </Link>
                <button style={styles.dangerBtn} onClick={() => deleteTank(tank._id)}>
                  Delete Tank
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.empty}>No tanks found.</div>
        )}
      </div>
    </div>
  );
}

export default Tanks;
