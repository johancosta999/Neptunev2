import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AdminNav from "../Nav/adminNav";

function AddStaff() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    role: "Admin", 
    location: "Negombo", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // 🎨 Professional UI styles
  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6", minHeight: "100vh" },
    card: {
      maxWidth: "820px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
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
    backLink: {
      padding: "10px 14px",
      backgroundColor: "#6b7280",
      color: "#ffffff",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 600,
    },
    body: { padding: "20px" },
    alertError: {
      color: "#991b1b",
      backgroundColor: "#fee2e2",
      border: "1px solid #fecaca",
      padding: "12px 14px",
      borderRadius: "8px",
      marginBottom: "12px",
      fontWeight: 600,
    },
    alertSuccess: {
      color: "#065f46",
      backgroundColor: "#d1fae5",
      border: "1px solid #a7f3d0",
      padding: "12px 14px",
      borderRadius: "8px",
      marginBottom: "12px",
      fontWeight: 600,
    },
    form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
    input: {
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      outline: "none",
      backgroundColor: "#ffffff",
    },
    select: {
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#ffffff",
    },
    actions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" },
    submit: {
      padding: "10px 16px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
      minWidth: "130px",
    },
    cancel: {
      padding: "10px 16px",
      backgroundColor: "#6b7280",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 700,
    },
  };

  // Cities list - only the required locations
  const cities = [
    "Negombo", "Kurunegala", "Ja-ela", "Wennappuwa"
  ];

  // Generate ID before submit (simple unique pattern)
  const generateStaffId = () => {
    return "STF-" + Math.floor(1000 + Math.random() * 9000);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Attach auto-generated ID
    const staffId = generateStaffId();
    const payload = { ...form, id: staffId };

    try {
      const res = await axios.post("http://localhost:5000/api/staff", payload);
      setSuccess("Staff added successfully!");

      // ✅ Send WhatsApp message
      const phoneNumber = form.phone.startsWith("+") ? form.phone : "+94" + form.phone;
      const message = `Hello ${form.name}! 🎉\nYour staff account has been created.\nStaff ID: ${staffId}\nPassword: ${form.password}`;
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, "_blank");

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/staffs");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add staff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <AdminNav />
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Add Staff</h1>
          <Link to="/staffs" style={styles.backLink}>Back</Link>
        </div>
        <div style={styles.body}>
          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                name="email"
                placeholder="name@example.com"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                name="phone"
                placeholder="07X XXX XXXX"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="Admin">Admin</option>
                <option value="Seller">Seller</option>
                <option value="Technician">Technician</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <select
                style={styles.select}
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {cities.map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                name="password"
                placeholder="Enter a secure password"
                value={form.password}
                onChange={handleChange}
                required
                type="password"
                disabled={loading}
              />
            </div>

            <div style={styles.actions}>
              <Link to="/staffs">
                <button type="button" style={styles.cancel}>Cancel</button>
              </Link>
              <button type="submit" disabled={loading} style={{ ...styles.submit, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Adding Staff..." : "Add Staff"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStaff;
