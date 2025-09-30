// src/pages/Issues/IssueList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./IssueList.css";

export default function IssueList() {
  const { tankId } = useParams(); // get tankId from URL
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `http://localhost:5000/api/issues/mine?tankId=${tankId}`
        );
        setIssues(res.data);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [tankId]);

  return (
    <div className="issue-list-container">
      <h2 className="issue-list-title">Reported Issues for Tank {tankId}</h2>

      {loading && <p className="issue-list-message">Loading issues...</p>}
      {error && <p className="issue-list-error">{error}</p>}

      {!loading && !error && issues.length === 0 && (
        <p className="issue-list-message">No issues reported yet for this tank.</p>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="issue-cards">
          {issues.map((issue) => (
            <div className="issue-card" key={issue._id}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
