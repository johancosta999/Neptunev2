import React, { useState } from "react";
import axios from "axios";
import Nav from "../Nav/nav";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./WaterLevel.css";

function AddWater() {
  const { tankId } = useParams();
  const history = useNavigate();
  const [form, setForm] = useState({
    currentLevel: "",
    maxCapacity: "",
    location: "",
    status: "",
    recordedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
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
      const res = await axios.post(`http://localhost:5000/api/waterlevel/${tankId}`, {
        tankId: tankId,
        currentLevel: Number(form.currentLevel),
        maxCapacity: Number(form.maxCapacity),
        location: form.location,
        status: form.status,
        recordedAt: new Date().toISOString(),
        userEmail: "johancosta08@gmail.com",
      });

      setSuccess("Water level record added successfully!");
      console.log(res.data);

      // Clear form
      setForm({
        currentLevel: "",
        maxCapacity: "",
        location: "",
        status: "",
        recordedAt: "",
      });

      // Redirect after success
      setTimeout(() => {
        history(`/tank/${tankId}/tank-level`);
      }, 1500);

    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to add water level record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "normal": return "var(--ok)";
      case "low": return "var(--warn)";
      case "critical": return "var(--bad)";
      default: return "var(--muted)";
    }
  };

  const calculatePercentage = () => {
    if (!form.currentLevel || !form.maxCapacity) return 0;
    return Math.round((Number(form.currentLevel) / Number(form.maxCapacity)) * 100);
  };

  const percentage = calculatePercentage();

  return (
    <div className="water-level-container">
     
      
      <div className="water-level-wrapper">
        <div className="water-level-header">
          <h1 className="water-level-title">💧 Add Water Level</h1>
          <p className="water-level-subtitle">Record water level measurements for tank monitoring</p>
        </div>

        <div className="water-level-card">
          <form onSubmit={handleSubmit} className="water-level-form">
            {/* Current Level Input */}
            <div className="form-group">
              <label htmlFor="currentLevel" className="form-label">
                📊 Current Level (L)
              </label>
              <input
                type="number"
                id="currentLevel"
                name="currentLevel"
                value={form.currentLevel}
                onChange={handleChange}
                placeholder="Enter current water level in liters"
                min="0"
                step="0.1"
                className="form-input"
                required
              />
            </div>

            {/* Max Capacity Input */}
            <div className="form-group">
              <label htmlFor="maxCapacity" className="form-label">
                🏺 Max Capacity (L)
              </label>
              <input
                type="number"
                id="maxCapacity"
                name="maxCapacity"
                value={form.maxCapacity}
                onChange={handleChange}
                placeholder="Enter maximum tank capacity in liters"
                min="1"
                step="0.1"
                className="form-input"
                required
              />
            </div>

            {/* Level Indicator */}
            {form.currentLevel && form.maxCapacity && (
              <div className="level-indicator">
                <span style={{ color: "var(--muted)", fontSize: "14px" }}>Level:</span>
                <div className="level-bar">
                  <div 
                    className="level-fill" 
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: percentage >= 80 ? "var(--ok)" : percentage >= 40 ? "var(--warn)" : "var(--bad)"
                    }}
                  />
                </div>
                <span className="level-percentage" style={{ color: percentage >= 80 ? "var(--ok)" : percentage >= 40 ? "var(--warn)" : "var(--bad)" }}>
                  {percentage}%
                </span>
              </div>
            )}

            {/* Location Input */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                📍 Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Building A, Floor 2"
                className="form-input"
              />
            </div>

            {/* Status Select */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                ⚠️ Water Level Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select status...</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="Critical">Critical</option>
              </select>
              
              {/* Status Indicator */}
              {form.status && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getStatusColor(form.status),
                      color: getStatusColor(form.status)
                    }}
                  />
                  <span className="status-text">
                    Current Status: {form.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="message error">
                ❌ {error}
              </div>
            )}
            
            {success && (
              <div className="message success">
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
                {loading ? "🔄 Adding..." : "💾 Add Water Level"}
              </button>
              
              <Link 
                to={`/tank/${tankId}/tank-level`}
                className="btn-secondary"
              >
                ← Back to Water Level List
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddWater;
