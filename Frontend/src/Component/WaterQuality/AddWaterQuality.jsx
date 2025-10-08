import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "../Nav/nav";
import "./EditWaterQuality.css";

function AddWaterQuality() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    phLevel: "",
    tds: "",
    status: "",
    timestamp: Date.now(),
  });

  const { tankId } = useParams();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const patterns = {
    phLevel: /^(?:[0-9]|1[0-4])(?:\.\d+)?$/,
    tds: /^([0-9]{1,3}|1000)$/,
  };

  const messages = {
    phLevel: "PH Level must be between 0 and 14",
    tds: "TDS must be between 0 and 1000",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (patterns[name]) {
      if (!patterns[name].test(value)) {
        setErrors((prevState) => ({
          ...prevState,
          [name]: messages[name],
        }));
      } else {
        setErrors((prevState) => ({
          ...prevState,
          [name]: "",
        }));
      }
    }

    setInputs((prevState) => ({
      ...prevState,
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

    // final validation
    for (let key in patterns) {
      if (!patterns[key].test(inputs[key])) {
        setError(`Please correct the field: ${key}`);
        setLoading(false);
        return;
      }
    }

    try {
      await sendRequest();
      setSuccess("Water quality record added successfully!");
      // Clear inputs
      setInputs({ phLevel: "", tds: "", status: "", timestamp: Date.now() });
      setTimeout(() => {
        history(`/tank/${tankId}/water-quality`);
      }, 1500);
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      setError(`Failed to add water quality record: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    const requestData = {
      tankId: tankId,
      phLevel: Number(inputs.phLevel),
      tds: Number(inputs.tds),
      status: String(inputs.status),
      timestamp: new Date().toISOString(),
      userEmail: "johancosta421@gmail.com",
    };
    
    console.log('Sending request data:', requestData);
    console.log('API URL:', `http://localhost:5000/api/waterquality/${tankId}`);
    
    const response = await axios.post(`http://localhost:5000/api/waterquality/${tankId}`, requestData);

    console.log('Response:', response.data);
    return response.data;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "safe": return "var(--ok)";
      case "unsafe": return "var(--bad)";
      default: return "var(--muted)";
    }
  };

  const getPHColor = (ph) => {
    const phValue = parseFloat(ph);
    if (phValue < 6.5) return "var(--bad)"; // Too acidic
    if (phValue > 8.5) return "var(--warn)"; // Too alkaline
    return "var(--ok)"; // Optimal range
  };

  const getTDSColor = (tds) => {
    const tdsValue = parseFloat(tds);
    if (tdsValue < 50) return "var(--warn)"; // Too low
    if (tdsValue > 500) return "var(--bad)"; // Too high
    return "var(--ok)"; // Optimal range
  };

  return (
    <div className="edit-water-quality-container">
      
      
      <div className="edit-form-wrapper">
        <div className="edit-header">
          <h1 className="edit-title">🧪 Add Water Quality</h1>
          <p className="edit-subtitle">Record water quality measurements for tank monitoring</p>
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
              {errors.phLevel && (
                <div className="error-message">
                  ❌ {errors.phLevel}
                </div>
              )}
              
              {/* PH Level Indicator */}
              {inputs.phLevel && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getPHColor(inputs.phLevel),
                      color: getPHColor(inputs.phLevel)
                    }}
                  />
                  <span className="status-text">
                    PH Level: {inputs.phLevel} 
                    {parseFloat(inputs.phLevel) < 6.5 ? " (Too Acidic)" : 
                     parseFloat(inputs.phLevel) > 8.5 ? " (Too Alkaline)" : 
                     " (Optimal)"}
                  </span>
                </div>
              )}
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
              {errors.tds && (
                <div className="error-message">
                  ❌ {errors.tds}
                </div>
              )}
              
              {/* TDS Level Indicator */}
              {inputs.tds && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getTDSColor(inputs.tds),
                      color: getTDSColor(inputs.tds)
                    }}
                  />
                  <span className="status-text">
                    TDS Level: {inputs.tds} mg/L
                    {parseFloat(inputs.tds) < 50 ? " (Too Low)" : 
                     parseFloat(inputs.tds) > 500 ? " (Too High)" : 
                     " (Optimal)"}
                  </span>
                </div>
              )}
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
                {loading ? "🔄 Adding..." : "💾 Add Water Quality Record"}
              </button>
              
              <Link 
                to={`/tank/${tankId}/water-quality`}
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

export default AddWaterQuality;
