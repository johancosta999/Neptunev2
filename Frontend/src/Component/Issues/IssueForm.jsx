import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./IssueForm.css";

export default function IssueForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tankId: "",
    title: "",
    description: "",
    category: "Other",
    priority: "Normal",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => fd.append(key, form[key]));
      files.forEach((f) => fd.append("attachments", f));

      await axios.post("http://localhost:5000/api/issues", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/issues/${form.tankId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-container">
      <h2 className="issue-title">Report an Issue</h2>
      <form className="issue-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tank ID</label>
          <input
            name="tankId"
            value={form.tankId}
            onChange={handleChange}
            placeholder="Enter your Tank ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Short summary of the issue"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the problem..."
            rows={4}
            required
          />
        </div>

        <div className="form-group-inline">
          <div>
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Water Quality</option>
              <option>Low Level</option>
              <option>Sensor Error</option>
              <option>Billing</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Attachments</label>
          <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
          <small className="hint">You can attach images or videos (optional)</small>
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}
