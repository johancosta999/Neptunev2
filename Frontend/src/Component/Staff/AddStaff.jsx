import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import AdminNav from "../Nav/adminNav";

function AddStaff() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    role: "Admin", 
    location: "Negombo", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  /* ---------------------- theme ------------------------ */
  // Admin orange accent (matching StaffList)
  const ACCENT = {
    main: "#f97316",
    soft: "#fb923c",
  };

  // Dark palette (matching StaffList)
  const BG = {
    page: "#0b1020",
    card: "#0e1628",
    border: "rgba(148,163,184,.16)",
  };

  const TEXT = {
    primary: "#e5e7eb",
    dim: "#cbd5e1",
  };

  // Cities list - only the required locations
  const cities = [
    "Negombo", "Kurunegala", "Ja-ela", "Wennappuwa"
  ];

  // Generate ID before submit (simple unique pattern)
  const generateStaffId = () => {
    return "STF-" + Math.floor(1000 + Math.random() * 9000);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Attach auto-generated ID
    const staffId = generateStaffId();
    const payload = { ...form, id: staffId };

    try {
      const res = await axios.post("http://localhost:5000/api/staff", payload);
      setSuccess("Staff added successfully!");

      // ✅ Send WhatsApp message
      const phoneNumber = form.phone.startsWith("+") ? form.phone : "+94" + form.phone;
      const message = `Hello ${form.name}! 🎉\nYour staff account has been created.\nStaff ID: ${staffId}\nPassword: ${form.password}`;
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, "_blank");

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/staffs");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add staff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        p: 2,
        backgroundColor: BG.page,
        color: TEXT.primary,
        boxSizing: "border-box",
      }}
    >
      <AdminNav />

      {/* Header Card */}
      <Box
        sx={{
          mt: 2,
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: BG.card,
          border: `1px solid ${BG.border}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              fontWeight: 900,
              letterSpacing: ".2px",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: ACCENT.main,
                boxShadow: `0 0 0 6px rgba(249,115,22,.15)`,
              }}
            />
            Add Staff
          </Typography>

          <Button
            component={Link}
            to="/staffs"
            variant="contained"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              background: `linear-gradient(135deg, #6b7280, #9ca3af)`,
              boxShadow: "0 8px 20px rgba(107,114,128,.28)",
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Back to Staff List
          </Button>
        </Box>
      </Box>

      {/* Form Card */}
      <Paper
        sx={{
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          borderRadius: 2,
          bgcolor: BG.card,
          border: `1px solid ${BG.border}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Alerts */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                bgcolor: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.2)",
                color: "#fca5a5",
                "& .MuiAlert-icon": { color: "#fca5a5" }
              }}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2, 
                bgcolor: "rgba(34,197,94,.1)",
                border: "1px solid rgba(34,197,94,.2)",
                color: "#6ee7b7",
                "& .MuiAlert-icon": { color: "#6ee7b7" }
              }}
            >
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              disabled={loading}
              InputLabelProps={{ sx: { color: TEXT.dim } }}
              InputProps={{
                sx: {
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              disabled={loading}
              InputLabelProps={{ sx: { color: TEXT.dim } }}
              InputProps={{
                sx: {
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="07X XXX XXXX"
              required
              disabled={loading}
              InputLabelProps={{ sx: { color: TEXT.dim } }}
              InputProps={{
                sx: {
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: TEXT.dim }}>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                disabled={loading}
                sx={{
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Seller">Seller</MenuItem>
                <MenuItem value="Technician">Technician</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: TEXT.dim }}>Location</InputLabel>
              <Select
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                disabled={loading}
                sx={{
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {cities.map((city, idx) => (
                  <MenuItem key={idx} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter a secure password"
              required
              disabled={loading}
              InputLabelProps={{ sx: { color: TEXT.dim } }}
              InputProps={{
                sx: {
                  color: TEXT.primary,
                  bgcolor: "#0a1220",
                  borderRadius: 2,
                },
              }}
            />

            {/* Actions */}
            <Box
              sx={{
                gridColumn: { xs: "1", md: "1 / -1" },
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                component={Link}
                to="/staffs"
                variant="contained"
                disabled={loading}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#334155",
                  color: "#e2e8f0",
                  "&:hover": { bgcolor: "#475569" },
                }}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  background: `linear-gradient(135deg, ${ACCENT.main}, ${ACCENT.soft})`,
                  boxShadow: "0 12px 24px rgba(249,115,22,.28)",
                  textTransform: "none",
                  borderRadius: 2,
                  minWidth: 140,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#0f172a" }} />
                    Adding...
                  </Box>
                ) : (
                  "Add Staff"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddStaff;
