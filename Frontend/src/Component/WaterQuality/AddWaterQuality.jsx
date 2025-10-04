import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "../Nav/nav";

function AddWaterQuality() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    phLevel: "",
    tds: "",
    status: "",
    timestamp: Date.now(),
  });

  const { tankId } = useParams();
  // const tankId = localStorage.getItem("selectedTankId");
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(""); // 👈 for success / fail

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
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Selected tankId:', tankId);

    // final validation
    for (let key in patterns) {
      if (!patterns[key].test(inputs[key])) {
        alert(`Please correct the field: ${key}`);
        return;
      }
    }

    try {
      await sendRequest();
      alert("✅ Successfully added water quality record.");
      // optionally: clear inputs
      setInputs({ phLevel: "", tds: "", status: "", timestamp: Date.now() });
      setTimeout(() => {
        history(`/tank/${tankId}/water-quality`);
      }, 1500);
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      alert(`❌ Failed to add water quality record: ${errorMessage}`);
    }
  };

  const sendRequest = async () => {
    const requestData = {
      tankId: tankId,
      phLevel: Number(inputs.phLevel),
      tds: Number(inputs.tds),
      status: String(inputs.status),
      timestamp: new Date().toISOString(),
      userEmail: "johancosta421@gmail.com", // You can get this from user context or localStorage
    };
    
    console.log('Sending request data:', requestData);
    console.log('API URL:', `http://localhost:5000/api/waterquality/${tankId}`);
    
    const response = await axios.post(`http://localhost:5000/api/waterquality/${tankId}`, requestData);

    console.log('Response:', response.data);
    return response.data;
  };

  return (
    <div>
      <Nav />
      <h2>Add Water Quality Record</h2>
      <form onSubmit={handleSubmit}>
        <label>PH Level:</label>
        <input
          type="number"
          name="phLevel"
          min={0}
          max={14}
          value={inputs.phLevel}
          onChange={handleChange}
          required
        />
        {errors.phLevel && (
          <span style={{ color: "red" }}>{errors.phLevel}</span>
        )}
        <br />

        <label>TDS:</label>
        <input
          type="number"
          name="tds"
          min={0}
          max={1000}
          value={inputs.tds}
          onChange={handleChange}
          required
        />
        {errors.tds && <span style={{ color: "red" }}>{errors.tds}</span>}
        <br />

        <label>Status:</label>
        <select
          name="status"
          value={inputs.status}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Status --</option>
          <option value="Safe">Safe</option>
          <option value="Unsafe">Unsafe</option>
        </select>
        <br />

        <br />

        <button type="submit">Submit</button>
      </form>

        <Link to={`/tank/${tankId}/water-quality`}>
        <button>Go back to Water Quality List</button>
        </Link>

      {feedback && (
        <p style={{ color: feedback.includes("✅") ? "green" : "red" }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

export default AddWaterQuality;
