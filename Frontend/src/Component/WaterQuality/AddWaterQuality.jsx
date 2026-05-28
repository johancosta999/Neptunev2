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
    salinity: "",
    ecValue: "",
    turbidity: "",
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
    salinity: /^([0-9]{1,2}|100)(?:\.\d+)?$/,
    ecValue: /^([0-9]{1,4}|10000)(?:\.\d+)?$/,
    turbidity: /^([0-9]{1,2}|100)(?:\.\d+)?$/,
  };

  const messages = {
    phLevel: "PH Level must be between 0 and 14",
    tds: "TDS must be between 0 and 1000",
    salinity: "Salinity must be between 0 and 100 ppt",
    ecValue: "EC Value must be between 0 and 10000 μS/cm",
    turbidity: "Turbidity must be between 0 and 100 NTU",
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
      setInputs({ phLevel: "", tds: "", salinity: "", ecValue: "", turbidity: "", status: "", timestamp: Date.now() });
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
      salinity: Number(inputs.salinity),
      ecValue: Number(inputs.ecValue),
      turbidity: Number(inputs.turbidity),
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

  const getSalinityColor = (salinity) => {
    const salinityValue = parseFloat(salinity);
    if (salinityValue < 0.5) return "var(--ok)"; // Fresh water
    if (salinityValue > 35) return "var(--warn)"; // Brine water
    return "var(--ok)"; // Brackish water (normal range)
  };

  const getECColor = (ecValue) => {
    const ecValueNum = parseFloat(ecValue);
    if (ecValueNum < 100) return "var(--warn)"; // Low conductivity
    if (ecValueNum > 2000) return "var(--bad)"; // High conductivity
    return "var(--ok)"; // Normal range
  };

  const getTurbidityColor = (turbidity) => {
    const turbidityValue = parseFloat(turbidity);
    if (turbidityValue < 1) return "var(--ok)"; // Clear water
    if (turbidityValue > 10) return "var(--bad)"; // Turbid water
    return "var(--warn)"; // Slightly cloudy
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

            {/* Salinity Input */}
            <div className="form-group">
              <label htmlFor="salinity" className="form-label">
                🧂 Salinity
              </label>
              <input
                type="number"
                id="salinity"
                name="salinity"
                value={inputs.salinity}
                onChange={handleChange}
                placeholder="Enter salinity in ppt"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                required
              />
              {errors.salinity && (
                <div className="error-message">
                  ❌ {errors.salinity}
                </div>
              )}
              
              {/* Salinity Level Indicator */}
              {inputs.salinity && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getSalinityColor(inputs.salinity),
                      color: getSalinityColor(inputs.salinity)
                    }}
                  />
                  <span className="status-text">
                    Salinity: {inputs.salinity} ppt
                    {parseFloat(inputs.salinity) < 0.5 ? " (Fresh Water)" : 
                     parseFloat(inputs.salinity) > 35 ? " (Brine Water)" : 
                     " (Brackish Water)"}
                  </span>
                </div>
              )}
            </div>

            {/* EC Value Input */}
            <div className="form-group">
              <label htmlFor="ecValue" className="form-label">
                ⚡ EC Value (Electrical Conductivity)
              </label>
              <input
                type="number"
                id="ecValue"
                name="ecValue"
                value={inputs.ecValue}
                onChange={handleChange}
                placeholder="Enter EC value in μS/cm"
                min="0"
                max="10000"
                step="1"
                className="form-input"
                required
              />
              {errors.ecValue && (
                <div className="error-message">
                  ❌ {errors.ecValue}
                </div>
              )}
              
              {/* EC Value Level Indicator */}
              {inputs.ecValue && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getECColor(inputs.ecValue),
                      color: getECColor(inputs.ecValue)
                    }}
                  />
                  <span className="status-text">
                    EC Value: {inputs.ecValue} μS/cm
                    {parseFloat(inputs.ecValue) < 100 ? " (Low)" : 
                     parseFloat(inputs.ecValue) > 2000 ? " (High)" : 
                     " (Normal)"}
                  </span>
                </div>
              )}
            </div>

            {/* Turbidity Input */}
            <div className="form-group">
              <label htmlFor="turbidity" className="form-label">
                🌊 Turbidity
              </label>
              <input
                type="number"
                id="turbidity"
                name="turbidity"
                value={inputs.turbidity}
                onChange={handleChange}
                placeholder="Enter turbidity in NTU"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                required
              />
              {errors.turbidity && (
                <div className="error-message">
                  ❌ {errors.turbidity}
                </div>
              )}
              
              {/* Turbidity Level Indicator */}
              {inputs.turbidity && (
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ 
                      backgroundColor: getTurbidityColor(inputs.turbidity),
                      color: getTurbidityColor(inputs.turbidity)
                    }}
                  />
                  <span className="status-text">
                    Turbidity: {inputs.turbidity} NTU
                    {parseFloat(inputs.turbidity) < 1 ? " (Clear)" : 
                     parseFloat(inputs.turbidity) > 10 ? " (Turbid)" : 
                     " (Slightly Cloudy)"}
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
