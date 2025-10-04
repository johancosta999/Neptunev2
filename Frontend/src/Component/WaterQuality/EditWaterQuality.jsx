import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

function EditWaterQuality() {
  const [inputs, setInputs] = useState({
    phLevel: "",
    tds: "",
    status: "",
  });

  const { id } = useParams();
  const { tankId } = useParams();
  const history = useNavigate();

  useEffect(() => {
    const fetchHandler = async () => {
      await axios
        .get(`http://localhost:5000/api/waterquality/${id}`)
        .then((res) => res.data)
        .then((data) => setInputs(data.record));
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    await axios
      .put(`http://localhost:5000/api/waterquality/${id}`, {
        phLevel: Number(inputs.phLevel),
        tds: Number(inputs.tds),
        status: String(inputs.status),
      })
      .then((res) => res.data);
  };

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const tankId = localStorage.getItem("selectedTankId");
  await sendRequest();
  history(`/tank/${inputs.tankId}/water-quality`);
};


  return (
    <div>
      <h2>Edit Water Quality Record</h2>
      <form onSubmit={handleSubmit}>
        <label>PH Level:</label>
        <input
          type="number"
          id="phLevel"
          name="phLevel"
          value={inputs.phLevel}
          onChange={handleChange}
          required
        />
        <br />
        <label>TDS:</label>
        <input
          type="number"
          id="tds"
          name="tds"
          value={inputs.tds}
          onChange={handleChange}
          required
        />
        <br />

        <label>Status:</label>
        <select
          name="status"
          value={inputs.status}
          onChange={handleChange}
          required
        >
          <option value="">{inputs.status}</option>
          <option value="Safe">Safe</option>
          <option value="Unsafe">Unsafe</option>
        </select>
        
        <br />
        <br />

        <button>Update Record</button>
      </form>

    <Link to={`/tank/${id}/water-quality`}>
        <button>Go back to Water Quality List</button>
        </Link>

    </div>
  );
}

export default EditWaterQuality;
