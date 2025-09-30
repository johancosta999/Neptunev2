import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditWaterlevel() {
  const [inputs, setInputs] = useState({
    currentLevel: "",
    maxCapacity: "",
    status: "",
    tankId: "", // ✅ Add this
  });

  const { id } = useParams(); // extract tank record ID from URL
  const navigate = useNavigate();
  
  const { tankId } = useParams();

  // Fetch existing data on component mount
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/waterlevel/${id}`);
        setInputs(res.data.record);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchHandler();
  }, [id]);

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`http://localhost:5000/api/waterlevel/${id}`, {
        currentLevel: Number(inputs.currentLevel),
        maxCapacity: Number(inputs.maxCapacity),
        status: String(inputs.status),
      });
      alert("✅ Water level updated!");

      
      navigate(`/tank/${inputs.tankId}/tank-level`);
 // Adjust the path as needed
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ Failed to update record.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#1e88e5" }}>Edit Water Level Record</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label>Current Level (L):</label>
        <input
          type="number"
          name="currentLevel"
          value={inputs.currentLevel}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Max Capacity (L):</label>
        <input
          type="number"
          name="maxCapacity"
          value={inputs.maxCapacity}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Status:</label>
        <input
          type="text"
          name="status"
          value={inputs.status}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Update Record</button>
      </form>
    </div>
  );
}

const containerStyle = {
  padding: "40px",
  maxWidth: "600px",
  margin: "auto",
  background: "#f3faff",
  borderRadius: "10px",
  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "12px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "none",
  background: "#1e88e5",
  color: "white",
  cursor: "pointer",
};

export default EditWaterlevel;
