import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

function EditStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    id: "",
    name: "", 
    email: "", 
    phone: "", 
    role: "", 
    location: "", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/staffs/${id}`);

        setForm(res.data.data);
      } catch (err) { 
        console.error(err);
        setError("Failed to load staff data");
      }
    };
    fetchStaff();
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await axios.put(`http://localhost:5000/api/staffs/${id}`, form);
      setSuccess("Staff updated successfully!");
      setTimeout(() => {
        navigate("/staffs");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update staff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Edit Staff</h1>
      
      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffe6e6", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "10px" 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: "green", 
          backgroundColor: "#e6ffe6", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "10px" 
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        

        <input 
          name="name" 
          placeholder="Full Name" 
          value={form.name} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        
        <input 
          name="email" 
          placeholder="Email Address" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        
        <input 
          name="phone" 
          placeholder="Phone Number" 
          value={form.phone} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        
        <input 
          name="role" 
          placeholder="Role/Position" 
          value={form.role} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        
        <input 
          name="location" 
          placeholder="Location/Department" 
          value={form.location} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        
        <input 
          name="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={handleChange} 
          required 
          type="password"
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Updating Staff..." : "Update Staff"}
        </button>
      </form>
      
      <div style={{ marginTop: "20px" }}>
        <Link to="/staffs" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Staff List
        </Link>
      </div>
    </div>
  );
}

export default EditStaff;
