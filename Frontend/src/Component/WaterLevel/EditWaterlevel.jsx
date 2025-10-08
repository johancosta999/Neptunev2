import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./WaterLevel.css";

function EditWaterlevel() {
  const [inputs, setInputs] = useState({
    currentLevel: "",
    maxCapacity: "",
    status: "",
    tankId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const { tankId } = useParams();

  // Fetch existing data on component mount
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/waterlevel/${id}`);
        setInputs(res.data.record);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load water level record");
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id]);

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await axios.put(`http://localhost:5000/api/waterlevel/${id}`, {
        currentLevel: Number(inputs.currentLevel),
        maxCapacity: Number(inputs.maxCapacity),
        status: String(inputs.status),
      });
      setSuccess("Water level record updated successfully!");
      
      // Redirect after success
      setTimeout(() => {
        navigate(`/tank/${inputs.tankId}/tank-level`);
      }, 1500);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update water level record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
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
    if (!inputs.currentLevel || !inputs.maxCapacity) return 0;
    return Math.round((Number(inputs.currentLevel) / Number(inputs.maxCapacity)) * 100);
  };

  const percentage = calculatePercentage();

  if (loading && !inputs.tankId) {
    return (
      <div className="water-level-container">
        <div className="water-level-wrapper">
          <div className="water-level-card">
            <div className="loading">
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "24px", marginBottom: "16px" }}>🔄</div>
                <div>Loading water level record...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="water-level-container">
      <div className="water-level-wrapper">
        <div className="water-level-header">
          <h1 className="water-level-title">💧 Edit Water Level</h1>
          <p className="water-level-subtitle">Update water level measurements for tank monitoring</p>
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
                value={inputs.currentLevel}
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
                value={inputs.maxCapacity}
                onChange={handleChange}
                placeholder="Enter maximum tank capacity in liters"
                min="1"
                step="0.1"
                className="form-input"
                required
              />
            </div>

            {/* Level Indicator */}
            {inputs.currentLevel && inputs.maxCapacity && (
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

            {/* Status Select */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                ⚠️ Water Level Status
              </label>
              <select
                name="status"
                value={inputs.status}
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
                {loading ? "🔄 Updating..." : "💾 Update Record"}
              </button>
              
              <Link 
                to={`/tank/${inputs.tankId}/tank-level`}
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

export default EditWaterlevel;
