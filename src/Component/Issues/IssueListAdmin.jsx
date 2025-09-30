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

  // For demo purposes, static list of technicians
  const technicians = [
    { id: "tech-1", name: "John Doe" },
    { id: "tech-2", name: "Jane Smith" },
    { id: "tech-3", name: "Ali Khan" },
  ];

  useEffect(() => {
  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`http://localhost:5000/api/issues/mine?tankId=${tankId}`);
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (tankId) fetchIssues();
}, [tankId]);


  const assignTech = async (issueId, techId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/issues/${issueId}/assign`,
        { technicianId: techId }
      );
      setIssues((prev) =>
        prev.map((i) =>
          i._id === issueId ? { ...i, assignedTo: techId } : i
        )
      );
      alert("Technician assigned successfully!");
    } catch (err) {
      alert("Failed to assign technician.");
      console.error(err);
    }
  };

  return (
   <div><Nav />

    <div className="issue-admin-container">

      
      <h2 className="issue-admin-title">All Reported Issues</h2>

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
                <p className="issue-card-attachments">
                  Attachments: {issue.attachments.length}
                </p>
              )}

              <div className="assign-tech">
                <label>Assign Technician:</label>
                <select
                  defaultValue={issue.assignedTo || ""}
                  onChange={(e) =>
                    assignTech(issue._id, e.target.value)
                  }
                >
                  <option value="">-- Select Technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {issue.assignedTo && (
                  <p className="assigned-label">
                    Assigned to:{" "}
                    {technicians.find((t) => t.id === issue.assignedTo)?.name ||
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
