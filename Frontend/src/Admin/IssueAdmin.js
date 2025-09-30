import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./IssueAdmin.css";

const STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];

export default function IssueAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/issues"); // ADMIN endpoint
        setItems(data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Admins only");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      const byStatus = !status || it.status === status;
      const byTerm =
        !term ||
        it.tankId?.toLowerCase().includes(term) ||
        it.title?.toLowerCase().includes(term);
      return byStatus && byTerm;
    });
  }, [items, q, status]);

  const setIssueStatus = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/issues/${id}/status`, {
        status: newStatus,
      });
      setItems((xs) => xs.map((x) => (x._id === id ? data : x)));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const delAdmin = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await api.delete(`/issues/${id}/admin`);
      setItems((xs) => xs.filter((x) => x._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>Admin • All Issues</h2>

        <div className="admin-controls">
          <input
            className="admin-search"
            placeholder="Search by tank or title"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search issues"
          />
          <select
            className="admin-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-state">Loading…</div>
      ) : err ? (
        <div className="admin-state error">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="admin-state">No issues match your filters.</div>
      ) : (
        <div className="admin-card">
          {/* Header row */}
          <div className="admin-head">
            <div>Tank</div>
            <div>Title</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Reported By</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* Data rows */}
          {filtered.map((it) => (
            <div key={it._id} className="admin-row">
              <div className="cell">{it.tankId}</div>

              <div className="cell titlecell" title={it.description || ""}>
                {it.title}
              </div>

              <div className="cell">
                <span
                  className={`badge ${
                    (it.priority || "").toLowerCase() || "low"
                  }`}
                >
                  {it.priority}
                </span>
              </div>

              <div className="cell">
                <select
                  className="status-select"
                  value={it.status}
                  onChange={(e) => setIssueStatus(it._id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cell">{it.reportedBy}</div>
              <div className="cell">
                {new Date(it.createdAt).toLocaleString()}
              </div>

              <div className="cell actions">
                <Link className="btn light" to={`/issues/${it._id}`}>
                  View
                </Link>
                <button className="btn danger" onClick={() => delAdmin(it._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}