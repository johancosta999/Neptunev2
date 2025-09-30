import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminNav from "../Nav/adminNav";

function StaffList() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState(""); // 🔍 search input
  const [roleFilter, setRoleFilter] = useState(""); // 🧩 role filter

  // 🎨 Reusable styles for a more professional UI
  const styles = {
    page: { padding: "24px", backgroundColor: "#f3f4f6" },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)",
    },
    cardHeader: {
      padding: "16px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    },
    title: { fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 },
    controls: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
    input: {
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      minWidth: "220px",
      outline: "none",
      backgroundColor: "#fff",
    },
    select: {
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#fff",
      minWidth: "160px",
    },
    primaryBtn: {
      padding: "10px 14px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
    },
    secondaryBtn: {
      padding: "10px 14px",
      backgroundColor: "#6b7280",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
    },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: "14px",
    },
    theadTr: { backgroundColor: "#f9fafb" },
    th: {
      position: "sticky",
      top: 0,
      backgroundColor: "#f9fafb",
      textAlign: "left",
      padding: "12px",
      borderBottom: "1px solid #e5e7eb",
      color: "#374151",
      zIndex: 1,
    },
    td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#111827" },
    actions: { display: "flex", gap: "8px" },
    editBtn: {
      padding: "6px 10px",
      backgroundColor: "#10b981",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
    },
    deleteBtn: {
      padding: "6px 10px",
      backgroundColor: "#ef4444",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
    },
    roleBadge: {
      display: "inline-block",
      padding: "4px 8px",
      backgroundColor: "#eef2ff",
      color: "#3730a3",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 600,
    },
    taskBadge: {
      display: "inline-block",
      padding: "4px 8px",
      backgroundColor: "#ecfeff",
      color: "#0e7490",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 600,
      minWidth: "28px",
      textAlign: "center",
    },
    empty: {
      textAlign: "center",
      padding: "48px",
      color: "#6b7280",
      backgroundColor: "#f9fafb",
      borderRadius: "10px",
      marginTop: "16px",
      border: "1px dashed #e5e7eb",
    },
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/staffs");
      setStaff(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staffs/${id}`);
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔖 Unique roles for filter dropdown
  const roles = Array.from(new Set(staff.map((s) => s.role).filter(Boolean)));

  // 🔎 Filter staff list by name and role
  const filteredStaff = staff.filter((s) => {
    const matchName = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || s.role === roleFilter;
    return matchName && matchRole;
  });

  return (

    
    <div style={styles.page}>
      <AdminNav /> 
      
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>Staff</h1>
          <div style={styles.controls}>
            
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Link to="/staffs/add">
              <button style={styles.primaryBtn}>Add Staff</button>
            </Link>
            
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadTr}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Assigned Tasks</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Password</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s, idx) => (
                <tr
                  key={s._id}
                  style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}
                >
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.phone}</td>
                  <td style={styles.td}>
                    <span style={styles.roleBadge}>{s.role}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.taskBadge}>
                      {Array.isArray(s.assignedTasks)
                        ? s.assignedTasks.length
                        : Array.isArray(s.tasks)
                        ? s.tasks.length
                        : "—"}
                    </span>
                  </td>
                  <td style={styles.td}>{s.location}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        backgroundColor: "#f3f4f6",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      {s.password || "N/A"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link to={`/staffs/edit/${s._id}`}>
                        <button style={styles.editBtn}>Edit</button>
                      </Link>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(s._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div style={{ padding: "20px" }}>
            <div style={styles.empty}>
              No staff members found. <Link to="/staffs/add">Add the first staff member</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffList;
