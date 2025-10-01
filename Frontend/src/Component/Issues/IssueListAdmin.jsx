// src/pages/Admin/IssueListAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./IssueListAdmin.css";
import Nav from "../Nav/nav";

export default function IssueListAdmin() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { tankId } = useParams();

  const [techs, setTechs] = useState([]);
  const [tankCityById, setTankCityById] = useState({});

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `http://localhost:5000/api/issues/mine?tankId=${tankId}`
        );
        const sorted = (res.data || []).sort((a, b) => {
          const aAssigned = !!a.assignedTo;
          const bAssigned = !!b.assignedTo;
          if (aAssigned === bAssigned)
            return new Date(b.createdAt) - new Date(a.createdAt);
          return aAssigned - bAssigned; // unassigned first
        });
        setIssues(sorted);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (tankId) fetchIssues();
  }, [tankId]);

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/staffs");
        setTechs(res.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadTechs();
  }, []);

  // Whenever issues list changes, fetch city for each tank (once)
  useEffect(() => {
    const fetchCities = async () => {
      const uniqueTankIds = Array.from(new Set(issues.map((i) => i.tankId)));
      const updates = {};
      await Promise.all(
        uniqueTankIds.map(async (id) => {
          if (tankCityById[id]) return; // already loaded
          try {
            const res = await axios.get(
              `http://localhost:5000/api/sellers/${id}`
            );
            if (res.data?.city) updates[id] = res.data.city;
          } catch (e) {
            /* ignore */
          }
        })
      );
      if (Object.keys(updates).length) {
        setTankCityById((prev) => ({ ...prev, ...updates }));
      }
    };
    if (issues.length) fetchCities();
  }, [issues]);

  const assignTech = async (issueId, techId) => {
    try {
      // ✅ Assign technician in backend
      await axios.patch(`http://localhost:5000/api/issues/${issueId}/assign`, {
        technicianId: techId,
      });

      // ✅ Update local state
      setIssues((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, assignedTo: techId } : i))
      );

      // ✅ Find technician details
      const tech = techs.find((t) => t._id === techId);

      // ✅ Fetch tank details to get owner contact
      const issue = issues.find((i) => i._id === issueId);
      if (issue?.tankId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/sellers/${issue.tankId}`
          );
          const tank = res.data;

          if (tank?.contactNumber) {
            const phoneNumber = tank.contactNumber.startsWith("+")
              ? tank.contactNumber
              : "+94" + tank.contactNumber;

            const message = `Hello ${tank.customerName || "Customer"}! 
Your reported issue for Tank ID: ${
              issue.tankId
            } has been assigned to a technician.

👨‍🔧 Technician: ${tech?.name || "Technician"}
📍 Location: ${tech?.location || "N/A"}
⚡ Issue: ${issue.title}

They will contact you soon. Thank you!`;

            // ✅ Open WhatsApp Web with pre-filled message
            window.open(
              `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                message
              )}`,
              "_blank"
            );
          }
        } catch (err) {
          console.error("Failed to fetch tank details for WhatsApp:", err);
        }
      }

      alert("Technician assigned successfully!");
    } catch (err) {
      alert("Failed to assign technician.");
      console.error(err);
    }
  };

  const markSolved = async (issueId) => {
  try {
    // ✅ Call the correct backend endpoint
    await axios.patch(`http://localhost:5000/api/issues/${issueId}/resolve`);

    // ✅ Update local state
    setIssues((prev) =>
      prev.map((i) => (i._id === issueId ? { ...i, status: "Resolved" } : i))
    );

    // ✅ Find issue details
    const issue = issues.find((i) => i._id === issueId);

    if (issue?.tankId) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sellers/${issue.tankId}`
        );
        const tank = res.data;

        if (tank?.contactNumber) {
          const phoneNumber = tank.contactNumber.startsWith("+")
            ? tank.contactNumber
            : "+94" + tank.contactNumber;

          const message = `Hello ${tank.customerName || "Customer"}!  
✅ Your reported issue for Tank ID: ${issue.tankId} has been marked as RESOLVED.  

⚡ Issue: ${issue.title}  
We hope everything is working perfectly now. Thank you for your patience! 🙏`;

          // ✅ Open WhatsApp Web with solved confirmation
          window.open(
            `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
              message
            )}`,
            "_blank"
          );
        }
      } catch (err) {
        console.error("Failed to fetch tank details for WhatsApp:", err);
      }
    }

    alert("Issue marked as solved!");
  } catch (err) {
    alert("Failed to update issue status.");
    console.error(err);
  }
};


  return (
    <div>
      <Nav />

      <div className="issue-admin-container">
        <h2 className="issue-admin-title">All Reported Issues</h2>

        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>

        {loading && <p className="issue-admin-message">Loading issues...</p>}
        {error && <p className="issue-admin-error">{error}</p>}

        {!loading && !error && issues.length === 0 && (
          <p className="issue-admin-message">No issues reported yet.</p>
        )}

        {!loading && !error && issues.length > 0 && (
          <div className="issue-admin-cards">
            {issues.map((issue) => (
              <div className="issue-admin-card" key={issue._id}>
                <div className="issue-card-header">
                  <h3 className="issue-card-title">{issue.title}</h3>
                  <span
                    className={`issue-status ${
                      issue.status === "Open"
                        ? "status-open"
                        : issue.status === "Resolved"
                        ? "status-resolved"
                        : "status-closed"
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    variant="contained"
                    color="success"
                    onClick={() => markSolved(issue._id)}
                  >
                    Mark as Solved
                  </button>
                </div>
                <p className="issue-card-desc">{issue.description}</p>
                <div className="issue-card-meta">
                  <span>Tank ID: {issue.tankId}</span>
                  <span>Category: {issue.category}</span>
                  <span>Priority: {issue.priority}</span>
                </div>
                <p className="issue-card-date">
                  Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                </p>

                {issue.attachments && issue.attachments.length > 0 && (
                  <div className="issue-card-attachments">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {issue.attachments.map((src, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000${src}`}
                          alt="attachment"
                          style={{
                            width: 120,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="assign-tech">
                  <label>Assign Technician:</label>
                  <select
                    defaultValue={issue.assignedTo || ""}
                    onChange={(e) => assignTech(issue._id, e.target.value)}
                  >
                    <option value="">-- Select Technician --</option>
                    {techs
                      .filter((t) => {
                        const tankCity = tankCityById[issue.tankId];
                        if (!tankCity) return true;
                        return (
                          (t.location || "").toLowerCase() ===
                          tankCity.toLowerCase()
                        );
                      })
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} {t.location ? `(${t.location})` : ""}
                        </option>
                      ))}
                  </select>
                  {issue.assignedTo && (
                    <p className="assigned-label">
                      Assigned to:{" "}
                      {techs.find((t) => t._id === issue.assignedTo)?.name ||
                        "Unknown"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
