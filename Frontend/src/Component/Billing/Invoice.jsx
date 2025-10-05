// src/Component/Billing/Invoice.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function Invoice() {
  const { tankId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); // optional: record passed from navigation
  const [record, setRecord] = useState(state?.record || null);
  const [loading, setLoading] = useState(!state?.record);

  useEffect(() => {
    if (state?.record) return;
    setLoading(true);
    axios
      .get("http://localhost:5000/api/sellers")
      .then((res) => {
        const list = res.data?.data || [];
        const found =
          list.find((r) => r.tankId === tankId) ||
          list.find((r) => String(r._id) === tankId);
        setRecord(found || null);
      })
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [state, tankId]);

  // Helpers
  const pkgName = useMemo(() => {
    const cap = String(record?.capacity || "");
    if (/350/.test(cap)) return "AquaLite";
    if (/500/.test(cap)) return "HydroMax";
    if (/750/.test(cap)) return "BlueWave";
    if (/1000/.test(cap)) return "OceanPro";
    return "Standard";
  }, [record]);

  const qty = 1;
  const unitPrice = Number(record?.price || 0);
  const subTotal = unitPrice * qty;
  const taxRate = 0; // change if needed
  const tax = Math.round(subTotal * taxRate);
  const total = subTotal + tax;

  const sellDateStr = useMemo(() => {
    if (!record?.sellDate) return "—";
    const d = new Date(record.sellDate);
    return isNaN(d) ? String(record.sellDate) : d.toLocaleDateString();
  }, [record]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#065f46", fontWeight: 800 }}>
        Loading invoice…
      </div>
    );
  }
  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <p>Couldn’t find a record for <b>{tankId}</b>.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  return (
    <>
      {/* Print/Screen styles */}
      <style>{`
        :root{
          --deep:#064e3b; --pri:#059669; --mint:#6ee7b7; --acc:#34d399;
          --ink:rgba(2,6,23,.92); --hair:rgba(2,6,23,.10); --line:#e2e8f0;
        }
        *{box-sizing:border-box}
        body{margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial}

        .page{
          min-height:100vh; padding:24px; display:flex; align-items:flex-start; justify-content:center;
          background: radial-gradient(900px 500px at 110% 0%, rgba(5,150,105,.14), transparent 55%),
                      linear-gradient(135deg, var(--deep) 0%, var(--pri) 40%, var(--acc) 100%);
        }
        .paper{
          width: 210mm; /* A4 */
          max-width: 100%;
          background:#fff; border:1px solid var(--line);
          border-radius: 14px; box-shadow:0 30px 60px rgba(2,6,23,.25);
          overflow: hidden;
        }
        .bar{
          display:flex; gap:10px; justify-content:flex-end; align-items:center;
          max-width: 210mm; width:100%; margin:0 auto 10px;
        }
        .bar .btn{
          height:38px; padding:0 14px; border-radius:10px; border:1px solid rgba(255,255,255,.35);
          color:#eafff6; background:rgba(255,255,255,.12); font-weight:800; cursor:pointer;
        }
        .bar .btn:hover{background:rgba(255,255,255,.2)}

        .head{
          background: linear-gradient(120deg, #059669, #34d399);
          color:#0b3b2b; padding:22px 26px; display:flex; justify-content:space-between; align-items:center;
        }
        .brand{display:flex; gap:12px; align-items:center; font-weight:900; font-size:18px;}
        .drop{width:22px;height:22px;border-radius:50%; background:linear-gradient(135deg,#10b981,#bbf7d0)}
        .meta{ text-align:right; color:#063d2e; font-weight:800 }
        .title{ margin:0; letter-spacing:.2px; }
        .invno{ font-size:13px; opacity:.9 }

        .content{ padding:20px 26px 26px; color:var(--ink) }
        .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:18px }
        .box{ border:1px solid var(--line); border-radius:10px; padding:14px; }
        .box h4{ margin:0 0 8px; font-size:14px; text-transform:uppercase; color:#0f766e; letter-spacing:.4px }

        .kv{ margin:6px 0; display:flex; gap:8px }
        .muted{ color:#475569 }

        table{ width:100%; border-collapse:collapse; margin-top:18px; }
        th, td{ border:1px solid var(--line); padding:10px 12px; font-size:14px; }
        th{ background:#f8fafc; text-align:left; color:#0f172a }
        tfoot td{ border:none; padding:6px 0 }
        .totals{ width: 260px; margin-left:auto; }
        .totals .row{ display:flex; justify-content:space-between; margin:6px 0; }
        .grand{ font-size:20px; font-weight:900; color:#064e3b; }

        .note{ margin-top:18px; font-size:12px; color:#475569 }

        @media print {
          .page{ background:#fff; padding:0; }
          .bar{ display:none !important; }
          .paper{ width:auto; border:none; border-radius:0; box-shadow:none; }
          .head{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Action Bar (hidden in print) */}
      <div className="page">
        <div className="bar">
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          <button className="btn" onClick={handlePrint}>Print</button>
        </div>

        <div className="paper">
          {/* Header */}
          <div className="head">
            <div className="brand">
              <span className="drop" />
              <div>
                <div className="title">Neptune Water Systems</div>
                <div style={{fontSize:12, fontWeight:700}}>Smart Water Management</div>
              </div>
            </div>
            <div className="meta">
              <div className="title">INVOICE</div>
              <div className="invno">
                Invoice No: {record.invoiceNumber || "—"}
                <br />
                Date: {sellDateStr}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            <div className="grid">
              <div className="box">
                <h4>Bill To</h4>
                <div className="kv"><b>Name:</b> {record.customerName || "—"}</div>
                <div className="kv"><b>Address:</b> {record.address || "—"}</div>
                <div className="kv"><b>City:</b> {record.city || "—"}</div>
                <div className="kv"><b>Email:</b> {record.customerEmail || "—"}</div>
                <div className="kv"><b>Phone:</b> {record.contactNumber || "—"}</div>
              </div>
              <div className="box">
                <h4>Project</h4>
                <div className="kv"><b>Tank ID:</b> {record.tankId}</div>
                <div className="kv"><b>Package:</b> {pkgName}</div>
                <div className="kv"><b>Capacity:</b> {record.capacity} L</div>
                <div className="kv"><b>Warranty:</b> {record.warranty} years</div>
              </div>
            </div>

            {/* Items */}
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price (Rs.)</th>
                  <th>Line Total (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    {pkgName} – {record.capacity}L tank
                    <div className="muted">Tank ID: {record.tankId}</div>
                    {record.description && <div className="muted">{record.description}</div>}
                  </td>
                  <td>{qty}</td>
                  <td>{unitPrice.toLocaleString()}</td>
                  <td>{subTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="row">
                <div>Subtotal</div>
                <div>Rs. {subTotal.toLocaleString()}</div>
              </div>
              <div className="row">
                <div>Tax ({(taxRate * 100).toFixed(0)}%)</div>
                <div>Rs. {tax.toLocaleString()}</div>
              </div>
              <div className="row grand">
                <div>Total</div>
                <div>Rs. {total.toLocaleString()}</div>
              </div>
            </div>

            <div className="note">
              Payments are due upon receipt unless otherwise agreed. Thank you for choosing <b>Neptune</b>.
              For support: support@neptune.io • +94 77 000 0000
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
