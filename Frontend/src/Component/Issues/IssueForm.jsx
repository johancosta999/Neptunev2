// src/Component/Client/IssueForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    try {
      const storedTankId = localStorage.getItem("tankId");
      if (storedTankId) {
        setForm((prev) => ({ ...prev, tankId: storedTankId }));
        return;
      }
      const loggedTank = JSON.parse(localStorage.getItem("loggedTank") || "null");
      if (loggedTank?.tankId) {
        setForm((prev) => ({ ...prev, tankId: loggedTank.tankId }));
      }
    } catch {}
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
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
    <div className="issue-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');
        :root { --ctrl-h: 46px; --ctrl-r: 12px; --ring: rgba(56,189,248,.28); }
        *, *::before, *::after { box-sizing: border-box; }
        .issue-shell{
          min-height:100vh; padding:24px;
          font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
          color:#e6f3ff; position:relative; overflow:hidden;
          background:
            radial-gradient(1200px 600px at -15% -10%, rgba(34,211,238,.16), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(96,165,250,.14), transparent 55%),
            linear-gradient(135deg,#0a0f1e 0%,#0a1726 45%,#0b1d31 100%);
          display:flex; align-items:flex-start; justify-content:center;
        }
        .issue-card{
          width:100%; max-width:760px;
          background:linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.64));
          border:1px solid rgba(148,163,184,.18);
          box-shadow:0 22px 60px rgba(0,0,0,.35);
          border-radius:18px; padding:22px 20px 20px; margin-top:26px;
          backdrop-filter:blur(10px);
        }
        .issue-badge{
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 10px; border-radius:9999px;
          border:1px solid rgba(148,163,184,.25);
          background:rgba(255,255,255,.06); color:#9ddcff; font-weight:800;
        }
        .issue-title{ margin:10px 0 2px; font-weight:900; font-size:28px; color:#eaf6ff; text-align:center; }
        .issue-sub{ text-align:center; color:#a9c4e0; margin-bottom:12px; font-size:14px; }
        .issue-form{ display:grid; gap:14px; }
        .form-group{ display:grid; gap:8px; }
        .form-group-inline{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:640px){ .form-group-inline{ grid-template-columns:1fr; } }

        .issue-label{
          font-size:12px; font-weight:900; letter-spacing:.4px;
          color:#9ddcff; text-transform:uppercase;
        }

        /* unified control styles */
        .issue-input, .issue-select, .issue-textarea, .issue-file{
          width:100%; border-radius:var(--ctrl-r);
          border:1px solid rgba(148,163,184,.25);
          background:rgba(2,6,23,.55); color:#e6f3ff;
          transition:border-color .15s, box-shadow .15s, background .15s;
        }
        .issue-input, .issue-select{
          height:var(--ctrl-h); padding:0 12px; line-height:var(--ctrl-h);
        }
        .issue-textarea{ min-height:120px; padding:12px; resize:vertical; }

        /* nice focus ring */
        .issue-input:focus, .issue-select:focus, .issue-textarea:focus, .issue-file:focus{
          border-color:#38bdf8; box-shadow:0 0 0 3px var(--ring);
          outline:none;
        }

        /* normalize <select> look & arrow */
        .issue-select{
          appearance:none; -webkit-appearance:none; -moz-appearance:none;
          padding-right:42px;  /* space for arrow */
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23a5b4fc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat:no-repeat; background-position:right 12px center;
          background-size:18px;
        }

        /* file input styled to same height */
        .issue-file{
          height:var(--ctrl-h); padding:0 12px; display:flex; align-items:center;
        }
        /* button portion */
        .issue-file::-webkit-file-upload-button{
          height:34px; margin-right:12px; padding:0 12px; border:0;
          border-radius:10px; cursor:pointer; color:#031926; font-weight:800;
          background:linear-gradient(135deg,#22d3ee,#3b82f6);
        }
        .issue-file::file-selector-button{
          height:34px; margin-right:12px; padding:0 12px; border:0;
          border-radius:10px; cursor:pointer; color:#031926; font-weight:800;
          background:linear-gradient(135deg,#22d3ee,#3b82f6);
        }

        .hint{ color:#9fbad2; font-size:12px; margin-top:4px; }
        .files-wrap{ display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
        .file-chip{
          padding:4px 8px; border-radius:9999px; font-size:12px;
          border:1px solid rgba(148,163,184,.25); color:#cfeaff; background:rgba(255,255,255,.06);
        }

        .submit-btn{
          height:var(--ctrl-h); border:none; border-radius:12px; cursor:pointer; font-weight:900;
          background:linear-gradient(135deg,#22d3ee,#3b82f6); color:#031926;
          box-shadow:0 18px 40px rgba(59,130,246,.35);
          transition:transform .15s ease, filter .15s ease;
        }
        .submit-btn:hover{ transform:translateY(-1px); filter:brightness(1.03); }
        .submit-btn:disabled{ opacity:.65; cursor:not-allowed; transform:none; }
      `}</style>

      <div className="issue-card">
        <div style={{ textAlign: "center" }}>
          <span className="issue-badge">🛠 Neptune Support</span>
          <h2 className="issue-title">Report an Issue</h2>
          <div className="issue-sub">
            Describe the problem and attach optional photos/videos.
          </div>
        </div>

        <form className="issue-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="issue-label">Tank ID</label>
            <input
              className="issue-input"
              name="tankId"
              value={form.tankId}
              onChange={handleChange}
              placeholder="Enter your Tank ID"
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="issue-label">Title</label>
            <input
              className="issue-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Short summary of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label className="issue-label">Description</label>
            <textarea
              className="issue-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the problem..."
              rows={4}
              required
            />
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label className="issue-label">Category</label>
              <select
                className="issue-select"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Water Quality</option>
                <option>Low Level</option>
                <option>Sensor Error</option>
                <option>Billing</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="issue-label">Priority</label>
              <select
                className="issue-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="issue-label">Attachments</label>
            <input
              className="issue-file"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <small className="hint">You can attach images or videos (optional)</small>
            {files.length > 0 && (
              <div className="files-wrap">
                {files.map((f, i) => (
                  <span className="file-chip" key={i}>{f.name}</span>
                ))}
              </div>
            )}
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
}
