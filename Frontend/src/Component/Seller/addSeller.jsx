// src/Component/Seller/AddSeller.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function AddSeller() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    tankId: "",
    customerName: "",
    address: "",
    city: "",
    customerEmail: "",
    sellDate: "",
    nicNumber: "",
    contactNumber: "",
    capacity: "",
    price: "",
    warranty: "",
    description: "",
    invoiceNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [savedRecord, setSavedRecord] = useState(null);
  const [notice, setNotice] = useState("");

  /* ----------------- helpers ----------------- */
  const priceMap = useMemo(
    () => ({ "350": 12000, "500": 17000, "750": 23000, "1000": 30000 }),
    []
  );

  const todayISO = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  };

  const generateTankId = () => {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
    return `TNK-${ymd}-${rand}`;
  };

  useEffect(() => {
    setInputs((s) => ({ ...s, tankId: generateTankId(), sellDate: todayISO() }));
  }, []);

  const setMsg = (m) => {
    setNotice(m);
    setTimeout(() => setNotice(""), 1500);
  };

  const validateField = (name, value) => {
    switch (name) {
      case "customerName":
        if (!/^[A-Za-z\s]+$/.test(value)) return "Use letters and spaces only";
        return "";
      case "city":
        if (!/^[A-Za-z\s]+$/.test(value)) return "Use letters and spaces only";
        return "";
      case "customerEmail":
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
        return "";
      case "sellDate": {
        const t = new Date(todayISO());
        const d = new Date(value);
        t.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() !== t.getTime()) return "Sell date must be today";
        return "";
      }
      case "nicNumber":
        if (!/^\d{12}$/.test(value)) return "NIC must be 12 digits";
        return "";
      case "invoiceNumber":
        if (!/^\d+$/.test(value)) return "Numbers only";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "radio" ? e.target.value : value;

    const next = { ...inputs, [name]: val };
    if (name === "capacity") next.price = priceMap[val] || 0;

    setInputs(next);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, val) }));
  };

  const sendRequest = (payload) =>
    axios.post("http://localhost:5000/api/sellers", payload);

  /* ----------------- WhatsApp message ----------------- */
  const pkgName = (cap) => {
    const c = String(cap);
    if (/350/.test(c)) return "AquaLite";
    if (/500/.test(c)) return "HydroMax";
    if (/750/.test(c)) return "BlueWave";
    if (/1000/.test(c)) return "OceanPro";
    return "Standard";
  };

  const sendWhatsApp = (phoneRaw, payload) => {
    try {
      const digitsOnly = (phoneRaw || "").replace(/\D/g, "");
      const phone = phoneRaw?.trim().startsWith("+") ? digitsOnly : `94${digitsOnly}`;

      const text =
        `Hello ${payload.name}! Your tank has been registered.\n` +
        `Tank ID: ${payload.tankId}\n` +
        (payload.password ? `Password: ${payload.password}\n` : "") +
        `Package: ${payload.package}\n` +
        `Capacity: ${payload.capacity} L\n` +
        `Warranty: ${payload.warranty} years\n` +
        `Price: Rs. ${Number(payload.price || 0).toLocaleString()}\n\n` +
        `You can now log in with your Tank ID${payload.password ? " and password" : ""}.`;

      const base = /Mobi|Android|iPhone/i.test(navigator.userAgent)
        ? "https://api.whatsapp.com/send"
        : "https://web.whatsapp.com/send";

      const url = `${base}?phone=${phone}&text=${encodeURIComponent(text)}`;
      const w = window.open(url, "_blank");
      if (!w || w.closed || typeof w.closed === "undefined") {
        window.location.href = url;
      }
    } catch (err) {
      console.error("WhatsApp open failed:", err);
    }
  };

  /* ----------------- submit ----------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErr = {};
    Object.keys(inputs).forEach((k) => {
      const msg = validateField(k, inputs[k]);
      if (msg) newErr[k] = msg;
    });
    if (Object.keys(newErr).length) {
      setErrors(newErr);
      setMsg("Fix highlighted fields");
      return;
    }

    const payload = {
      ...inputs,
      capacity: Number(inputs.capacity),
      price: Number(inputs.price),
      warranty: Number(inputs.warranty),
    };

    try {
      await sendRequest(payload);
      setSavedRecord(payload);
      setMsg("Saved. You can print the bill now.");

      // 👇 Send WhatsApp confirmation to the buyer
      sendWhatsApp(inputs.contactNumber, {
        name: inputs.customerName,
        tankId: inputs.tankId,
        password: inputs.password,
        package: pkgName(inputs.capacity),
        capacity: Number(inputs.capacity || 0),
        warranty: Number(inputs.warranty || 0),
        price: Number(inputs.price || 0),
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add seller");
    }
  };

  /* ----------------- print (no popups) ----------------- */
  function printViaIframe(htmlString) {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const idoc = iframe.contentDocument || iframe.contentWindow.document;
    idoc.open();
    idoc.write(htmlString);
    idoc.close();

    setTimeout(() => {
      const win = iframe.contentWindow || iframe;
      win.focus();
      win.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  }

  function printInvoice() {
    if (!savedRecord) {
      setMsg("Save first, then print.");
      return;
    }

    const linePrice = Number(savedRecord.price || 0).toLocaleString();

    const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Invoice - ${savedRecord.tankId}</title></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a">
    <div style="width:210mm;margin:0 auto;background:#ffffff">
      <div style="display:flex;justify-content:space-between;align-items:center;background:#059669;color:#ffffff;padding:16px 20px">
        <div style="margin:0;font-weight:900;font-size:18px">Neptune Water Systems</div>
        <div style="text-align:right;font-weight:800">
          <div>INVOICE</div>
          <div style="font-size:13px">Invoice No: ${savedRecord.invoiceNumber || "—"}<br/>Date: ${new Date(savedRecord.sellDate).toLocaleDateString()}</div>
        </div>
      </div>

      <div style="padding:16px 20px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px">
            <div style="margin:0 0 6px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.35px;text-transform:uppercase">Bill To</div>
            <div style="margin:4px 0"><b>Name:</b> ${savedRecord.customerName || "—"}</div>
            <div style="margin:4px 0"><b>Address:</b> ${savedRecord.address || "—"}</div>
            <div style="margin:4px 0"><b>City:</b> ${savedRecord.city || "—"}</div>
            <div style="margin:4px 0"><b>Email:</b> ${savedRecord.customerEmail || "—"}</div>
            <div style="margin:4px 0"><b>Phone:</b> ${savedRecord.contactNumber || "—"}</div>
          </div>

          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px">
            <div style="margin:0 0 6px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.35px;text-transform:uppercase">Project</div>
            <div style="margin:4px 0"><b>Tank ID:</b> ${savedRecord.tankId}</div>
            <div style="margin:4px 0"><b>Package:</b> ${pkgName(savedRecord.capacity)}</div>
            <div style="margin:4px 0"><b>Capacity:</b> ${savedRecord.capacity} L</div>
            <div style="margin:4px 0"><b>Warranty:</b> ${savedRecord.warranty} years</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-top:12px">
          <thead>
            <tr>
              <th style="text-align:left;border:1px solid #e5e7eb;padding:8px 10px;background:#f8fafc">#</th>
              <th style="text-align:left;border:1px solid #e5e7eb;padding:8px 10px;background:#f8fafc">Description</th>
              <th style="text-align:left;border:1px solid #e5e7eb;padding:8px 10px;background:#f8fafc">Qty</th>
              <th style="text-align:left;border:1px solid #e5e7eb;padding:8px 10px;background:#f8fafc">Unit Price (Rs.)</th>
              <th style="text-align:left;border:1px solid #e5e7eb;padding:8px 10px;background:#f8fafc">Line Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">1</td>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">
                ${pkgName(savedRecord.capacity)} – ${savedRecord.capacity}L tank
                <div style="color:#64748b">Tank ID: ${savedRecord.tankId}</div>
                ${savedRecord.description ? `<div style="color:#64748b">${savedRecord.description}</div>` : ""}
              </td>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">1</td>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">${linePrice}</td>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">${linePrice}</td>
            </tr>
          </tbody>
        </table>

        <div style="width:240px;margin-left:auto;margin-top:10px">
          <div style="display:flex;justify-content:space-between;margin:4px 0">
            <div>Subtotal</div><div>Rs. ${linePrice}</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin:4px 0">
            <div>Tax (0%)</div><div>Rs. 0</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin:4px 0;font-size:18px;font-weight:900">
            <div>Total</div><div>Rs. ${linePrice}</div>
          </div>
        </div>

        <div style="margin-top:10px;font-size:12px;color:#475569">
          Thanks for choosing <b>Neptune</b>. Support: support@neptune.io • +94 77 000 0000
        </div>
      </div>
    </div>
    <script>window.onload=function(){window.focus();}</script>
  </body>
</html>`;
    printViaIframe(html);
  }

  /* ----------------- DARK THEME STYLES ----------------- */
  const S = {
    page: {
      minHeight: "100vh",
      padding: 16,
      background:
        "radial-gradient(1200px 600px at -15% -20%, rgba(16,185,129,.12), transparent 60%)," +
        "radial-gradient(900px 500px at 110% 0%, rgba(99,102,241,.10), transparent 55%)," +
        "linear-gradient(135deg, #0b1020 0%, #0c1b1b 40%, #0d1b2a 100%)",
      color: "#e5e7eb",
    },

    nav: {
      maxWidth: 1200,
      margin: "0 auto 16px",
      height: 56,
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      boxShadow: "0 12px 28px rgba(0,0,0,.35)",
      color: "#f1f5f9",
    },

    shell: {
      maxWidth: 1200,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "minmax(640px, 1.2fr) minmax(380px, .8fr)",
      gap: 16,
    },

    card: {
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      padding: 20,
      color: "#e5e7eb",
    },

    input: {
      width: "100%",
      height: 44,
      padding: "0 12px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,.25)",
      background: "rgba(2,6,23,.6)",
      outline: "none",
      color: "#f8fafc",
    },

    label: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: ".4px",
      color: "rgba(226,232,240,.85)",
      margin: "10px 0 6px",
      textTransform: "uppercase",
    },

    row: { display: "flex", gap: 10, alignItems: "center", marginBottom: 10 },

    chipRow: { display: "flex", gap: 10, flexWrap: "wrap" },

    chip: (active) => ({
      height: 36,
      padding: "0 12px",
      borderRadius: 12,
      border: active ? "1px solid rgba(16,185,129,.45)" : "1px solid rgba(148,163,184,.25)",
      background: active ? "rgba(16,185,129,.16)" : "rgba(255,255,255,.05)",
      color: active ? "#a7f3d0" : "#e5e7eb",
      fontWeight: 800,
      cursor: "pointer",
    }),

    btn: {
      height: 44,
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "#03221f",
      fontWeight: 900,
      cursor: "pointer",
      marginTop: 8,
      boxShadow: "0 12px 24px rgba(16,185,129,.28)",
    },

    tiny: {
      height: 36,
      padding: "0 12px",
      borderRadius: 12,
      fontWeight: 800,
      border: "1px solid rgba(16,185,129,.35)",
      background: "rgba(16,185,129,.12)",
      color: "#a7f3d0",
      cursor: "pointer",
    },

    error: {
      color: "#fca5a5",
      fontSize: 12,
      fontWeight: 800,
      marginTop: 6,
    },

    noteBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "10px 12px",
      border: "1px solid rgba(16,185,129,.35)",
      borderRadius: 12,
      background: "rgba(16,185,129,.12)",
      color: "#a7f3d0",
      marginBottom: 12,
      fontWeight: 800,
    },
  };

  return (
    <div style={S.page}>
      <div style={S.nav}>
        <div style={{ fontWeight: 900 }}>Neptune — Add Tank</div>
        <Link
          to="/seller/dashboard"
          style={{ fontWeight: 800, color: "#a7f3d0", textDecoration: "none" }}
        >
          Back
        </Link>
      </div>

      <div style={S.shell}>
        {/* LEFT: FORM */}
        <div style={S.card}>
          <h2 style={{ margin: "0 0 6px", fontWeight: 900, color: "#f1f5f9" }}>
            Add Tanks
          </h2>
          <p style={{ margin: "0 0 12px", color: "rgba(226,232,240,.75)" }}>
            Save the tank, then print a clean white invoice (no pop-ups).
          </p>

          {savedRecord && (
            <div style={S.noteBox}>
              <span>Tank saved. You can print the bill now.</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.tiny} onClick={printInvoice}>
                  Print Bill
                </button>
                <button
                  style={{
                    ...S.tiny,
                    borderColor: "rgba(148,163,184,.25)",
                    background: "rgba(255,255,255,.06)",
                    color: "#e5e7eb",
                  }}
                  onClick={() => {
                    setInputs({
                      tankId: generateTankId(),
                      customerName: "",
                      address: "",
                      city: "",
                      customerEmail: "",
                      sellDate: todayISO(),
                      nicNumber: "",
                      contactNumber: "",
                      capacity: "",
                      price: "",
                      warranty: "",
                      description: "",
                      invoiceNumber: "",
                      password: "",
                    });
                    setSavedRecord(null);
                    setMsg("Ready for next customer");
                  }}
                >
                  Add Another
                </button>
              </div>
            </div>
          )}

          <div style={S.row}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 800,
                background: "rgba(2,6,23,.6)",
                border: "1px solid rgba(148,163,184,.25)",
                color: "#a7f3d0",
              }}
            >
              {inputs.tankId || "—"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{
                  ...S.tiny,
                  borderColor: "rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  color: "#e5e7eb",
                }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inputs.tankId);
                    setMsg("Tank ID copied");
                  } catch {
                    setMsg("Copy not available");
                  }
                }}
              >
                Copy ID
              </button>
              <button
                type="button"
                style={S.tiny}
                onClick={() =>
                  setInputs((s) => ({ ...s, tankId: generateTankId() }))
                }
              >
                Regenerate
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={S.label}>Customer Name</div>
            <input
              style={S.input}
              name="customerName"
              value={inputs.customerName}
              onChange={handleChange}
            />
            {errors.customerName && (
              <div style={S.error}>{errors.customerName}</div>
            )}

            <div style={S.label}>NIC Number</div>
            <input
              style={S.input}
              name="nicNumber"
              value={inputs.nicNumber}
              onChange={handleChange}
            />
            {errors.nicNumber && (
              <div style={S.error}>{errors.nicNumber}</div>
            )}

            <div style={S.label}>Email</div>
            <input
              style={S.input}
              type="email"
              name="customerEmail"
              value={inputs.customerEmail}
              onChange={handleChange}
            />
            {errors.customerEmail && (
              <div style={S.error}>{errors.customerEmail}</div>
            )}

            <div style={S.label}>Contact Number</div>
            <input
              style={S.input}
              name="contactNumber"
              value={inputs.contactNumber}
              onChange={handleChange}
            />

            <div style={S.label}>Address</div>
            <input
              style={S.input}
              name="address"
              value={inputs.address}
              onChange={handleChange}
            />

            <div style={S.label}>City</div>
            <input
              style={S.input}
              name="city"
              value={inputs.city}
              onChange={handleChange}
            />
            {errors.city && <div style={S.error}>{errors.city}</div>}

            <div style={S.label}>Sell Date (must be today)</div>
            <input
              style={S.input}
              type="date"
              name="sellDate"
              value={inputs.sellDate}
              onChange={handleChange}
            />
            {errors.sellDate && <div style={S.error}>{errors.sellDate}</div>}

            <div style={S.label}>Capacity / Package</div>
            <div style={S.chipRow}>
              {[
                { v: "350", label: "AquaLite • 350L" },
                { v: "500", label: "HydroMax • 500L" },
                { v: "750", label: "BlueWave • 750L" },
                { v: "1000", label: "OceanPro • 1000L" },
              ].map((o) => (
                <label key={o.v} style={S.chip(inputs.capacity === o.v)}>
                  <input
                    type="radio"
                    name="capacity"
                    value={o.v}
                    checked={inputs.capacity === o.v}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  {o.label}
                </label>
              ))}
            </div>

            <div style={S.label}>Price (auto)</div>
            <input style={S.input} name="price" value={inputs.price} readOnly />

            <div style={S.label}>Warranty</div>
            <div style={S.chipRow}>
              {[
                { v: "5", label: "5 years" },
                { v: "10", label: "10 years" },
              ].map((o) => (
                <label key={o.v} style={S.chip(inputs.warranty === o.v)}>
                  <input
                    type="radio"
                    name="warranty"
                    value={o.v}
                    checked={inputs.warranty === o.v}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  {o.label}
                </label>
              ))}
            </div>

            <div style={S.label}>Description</div>
            <input
              style={S.input}
              name="description"
              value={inputs.description}
              onChange={handleChange}
            />

            <div style={S.label}>Invoice Number</div>
            <input
              style={S.input}
              name="invoiceNumber"
              value={inputs.invoiceNumber}
              onChange={handleChange}
            />
            {errors.invoiceNumber && (
              <div style={S.error}>{errors.invoiceNumber}</div>
            )}

            <div style={S.label}>Password</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                name="password"
                value={inputs.password}
                onChange={handleChange}
              />
              <button
                type="button"
                style={{
                  ...S.tiny,
                  borderColor: "rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  color: "#e5e7eb",
                }}
                onClick={() => {
                  const chars =
                    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%";
                  let p = "";
                  for (let i = 0; i < 12; i++)
                    p += chars[Math.floor(Math.random() * chars.length)];
                  setInputs((s) => ({ ...s, password: p }));
                  setMsg("Secure password generated");
                }}
              >
                Generate
              </button>
            </div>

            <button type="submit" style={S.btn}>
              Submit
            </button>
          </form>

          {notice && (
            <div
              style={{
                position: "fixed",
                left: "50%",
                bottom: 24,
                transform: "translateX(-50%)",
                background: "rgba(3,7,18,.92)",
                color: "#f8fafc",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              {notice}
            </div>
          )}
        </div>

        {/* RIGHT: Minimal live preview */}
        <div
          style={{
            ...S.card,
            position: "sticky",
            top: 76,
            height: "fit-content",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              height: 32,
              padding: "0 10px",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,.25)",
              background: "rgba(255,255,255,.06)",
              fontWeight: 800,
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <h3 style={{ margin: "0 0 8px", fontWeight: 900, color: "#f1f5f9" }}>
            Live Preview
          </h3>
          <div
            style={{
              border: "1px dashed rgba(148,163,184,.25)",
              borderRadius: 12,
              padding: 14,
              background: "rgba(2,6,23,.6)",
            }}
          >
            <div style={{ margin: "6px 0" }}>
              <b>Customer:</b> {inputs.customerName || "—"}
            </div>
            <div style={{ margin: "6px 0" }}>
              <b>Email:</b> {inputs.customerEmail || "—"}
            </div>
            <div style={{ margin: "6px 0" }}>
              <b>Address:</b> {inputs.address || "—"}
            </div>
            <div style={{ margin: "6px 0" }}>
              <b>Contact:</b> {inputs.contactNumber || "—"}
            </div>
            <div style={{ margin: "6px 0" }}>
              <b>Date:</b> {inputs.sellDate || "—"}
            </div>
            <hr
              style={{
                border: "none",
                borderTop: "1px dashed rgba(148,163,184,.25)",
                margin: "10px 0",
              }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0" }}>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  fontWeight: 800,
                  color: "#a7f3d0",
                }}
              >
                Package: {pkgName(inputs.capacity)}
              </span>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  fontWeight: 800,
                  color: "#a7f3d0",
                }}
              >
                Capacity: {inputs.capacity ? `${inputs.capacity} L` : "—"}
              </span>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  fontWeight: 800,
                  color: "#a7f3d0",
                }}
              >
                Warranty: {inputs.warranty ? `${inputs.warranty} yrs` : "—"}
              </span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 20,
                fontWeight: 900,
                color: "#f1f5f9",
              }}
            >
              {inputs.price
                ? `Rs. ${Number(inputs.price).toLocaleString()}`
                : "Rs. —"}
            </div>
          </div>

          {savedRecord && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={S.tiny} onClick={printInvoice}>
                Print Bill
              </button>
              <button
                style={{
                  ...S.tiny,
                  borderColor: "rgba(148,163,184,.25)",
                  background: "rgba(255,255,255,.06)",
                  color: "#e5e7eb",
                }}
                onClick={() => navigate("/seller/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
