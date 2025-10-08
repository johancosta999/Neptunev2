import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./EditWaterQuality.css";

function EditWaterQuality() {
  const [inputs, setInputs] = useState({
    phLevel: "",
    tds: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams();
  const { tankId } = useParams();
  const history = useNavigate();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/waterquality/${id}`);
        setInputs(response.data.record);
      } catch (err) {
        setError("Failed to load water quality record");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    try {
      await axios.put(`http://localhost:5000/api/waterquality/${id}`, {
        phLevel: Number(inputs.phLevel),
        tds: Number(inputs.tds),
        status: String(inputs.status),
      });
      setSuccess("Water quality record updated successfully!");
    } catch (err) {
      setError("Failed to update water quality record");
      console.error("Error updating data:", err);
    }
  };

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await sendRequest();
      // Redirect after successful update
      setTimeout(() => {
        history(`/tank/${inputs.tankId}/water-quality`);
      }, 1500);
    } catch (err) {
      setError("Failed to update water quality record");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "safe": return "var(--ok)";
      case "unsafe": return "var(--bad)";
      default: return "var(--muted)";
    }
  };

  return (
    <div className="edit-water-quality-container">
      <div className="edit-form-wrapper">
        <div className="edit-header">
          <h1 className="edit-title">🧪 Edit Water Quality</h1>
          <p className="edit-subtitle">Update water quality measurements for tank monitoring</p>
        </div>

        <div className="edit-form-card">
          <form onSubmit={handleSubmit} className="edit-form">
            {/* PH Level Input */}
            <div className="form-group">
              <label htmlFor="phLevel" className="form-label">
                📊 PH Level
              </label>
              <input
                type="number"
                id="phLevel"
                name="phLevel"
                value={inputs.phLevel}
                onChange={handleChange}
                placeholder="Enter pH level (0-14)"
                min="0"
                max="14"
                step="0.1"
                className="form-input"
                required
              />
            </div>

            {/* TDS Input */}
            <div className="form-group">
              <label htmlFor="tds" className="form-label">
                💧 TDS (Total Dissolved Solids)
              </label>
              <input
                type="number"
                id="tds"
                name="tds"
                value={inputs.tds}
                onChange={handleChange}
                placeholder="Enter TDS in mg/L"
                min="0"
                max="1000"
                step="1"
                className="form-input"
                required
              />
            </div>

            {/* Status Select */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                ⚠️ Water Quality Status
              </label>
              <select
                name="status"
                value={inputs.status}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select status...</option>
                <option value="safe">Safe</option>
                <option value="unsafe">Unsafe</option>
              </select>
              
              {/* Status Indicator */}
              {inputs.status && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getStatusColor(inputs.status),
                      color: getStatusColor(inputs.status)
                    }}
                  />
                  <span className="status-text">
                    Current Status: {inputs.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div style={{ 
                color: "var(--bad)", 
                background: "rgba(239,68,68,.1)", 
                padding: "12px 16px", 
                borderRadius: "8px", 
                border: "1px solid rgba(239,68,68,.2)",
                fontSize: "14px",
                fontWeight: "600"
              }}>
                ❌ {error}
              </div>
            )}
            
            {success && (
              <div style={{ 
                color: "var(--ok)", 
                background: "rgba(16,185,129,.1)", 
                padding: "12px 16px", 
                borderRadius: "8px", 
                border: "1px solid rgba(16,185,129,.2)",
                fontSize: "14px",
                fontWeight: "600"
              }}>
                ✅ {success}
              </div>
            )}

            {/* Action Buttons */}
            <div className="button-group">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "🔄 Updating..." : "💾 Update Record"}
              </button>
              
              <Link 
                to={`/tank/${inputs.tankId}/water-quality`}
                className="btn-secondary"
              >
                ← Back to Water Quality List
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditWaterQuality;
