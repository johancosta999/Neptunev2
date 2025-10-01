// src/Component/Pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Divider,
  GlobalStyles,
} from "@mui/material";
import NumbersIcon from "@mui/icons-material/Numbers";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const c = {
  deep: "#0B2A3B",   // deep navy
  ocean: "#0E7490", // teal
  aqua: "#38BDF8",  // sky
  mint: "#14B8A6",  // accent
  foam: "#E6F9FF",  // highlight
  border: "#E5E7EB",
  muted: "rgba(2,6,23,.64)",
};

export default function Login() {
  const [tab, setTab] = useState(0); // 0 = User, 1 = Admin, 2 = Seller
  const [usernameOrId, setUsernameOrId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [userRecords, setUserRecords] = useState([]);
  const [staffRecords, setStaffRecords] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/sellers")
      .then((res) => setUserRecords(res.data.data || []))
      .catch((err) => console.log(err));

    axios.get("http://localhost:5000/api/staffs")
      .then((res) => setStaffRecords(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (tab === 1) {
      const staff = staffRecords.find((s) => s.id === usernameOrId && s.password === pw);
      if (staff) {
        localStorage.setItem("admin", JSON.stringify(staff));
        navigate("/tanks", { replace: true });
      } else setError("Invalid Staff ID or Password");
    } else if (tab === 2) {
      const staff = staffRecords.find((s) => s.id === usernameOrId && s.password === pw);
      if (staff) {
        localStorage.setItem("sellerStaff", JSON.stringify(staff));
        navigate("/seller/dashboard", { replace: true });
      } else setError("Invalid Staff ID or Password");
    } else {
      const tank = userRecords.find((t) => t.tankId === usernameOrId && t.password === pw);
      if (tank) {
        localStorage.setItem("tankId", tank.tankId);
        localStorage.setItem("loggedTank", JSON.stringify(tank));
        navigate("/homepage", { replace: true });
      } else setError("Invalid Tank ID or Password");
    }
  };

  return (
    <Box
      id="auth-login"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, md: 4 },
        // full-page water gradient (no images)
        background: `
          radial-gradient(1200px 600px at -15% -20%, rgba(56,189,248,.18), transparent 60%),
          radial-gradient(900px 500px at 110% 0%, rgba(14,116,144,.16), transparent 55%),
          linear-gradient(135deg, ${c.deep} 0%, ${c.ocean} 45%, ${c.aqua} 100%)
        `,
      }}
    >
      <GlobalStyles
        styles={{
          "#auth-login input::-ms-reveal, #auth-login input::-ms-clear, #auth-login input::-webkit-search-cancel-button": { display: "none !important" },
          "input:-webkit-autofill, input:-webkit-autofill:focus": { transition: "background-color 600000s 0s, color 600000s 0s" },
        }}
      />

      <Paper
        elevation={18}
        sx={{
          width: "100%",
          maxWidth: 1180,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(11,42,59,.28)",
          bgcolor: "background.paper",
          border: `1px solid ${c.border}`,
        }}
      >
        <Grid container sx={{ minHeight: { xs: 0, md: 620 } }}>
          {/* LEFT HERO (pure CSS + inline SVG wave, no images) */}
          <Grid
            item xs={12} md={6}
            sx={{
              p: { xs: 4, md: 6 },
              color: "#fff",
              position: "relative",
              background: `
                radial-gradient(closest-side at 22% 22%, ${c.aqua} .9, transparent 58%),
                radial-gradient(closest-side at 78% 16%, ${c.mint} .85, transparent 56%),
                radial-gradient(closest-side at 64% 86%, ${c.ocean} .9, transparent 60%),
                linear-gradient(135deg, ${c.deep} 0%, ${c.ocean} 58%, ${c.aqua} 110%)
              `,
              backgroundRepeat: "no-repeat",
              backgroundSize: "140% 140%",
            }}
          >
            {/* soft wave overlay */}
            <Box component="svg" viewBox="0 0 1440 120" preserveAspectRatio="none"
              sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, color: "rgba(255,255,255,.18)" }}>
              <path d="M0,72 C280,120 560,16 840,42 C1120,68 1280,50 1440,24 L1440,120 L0,120 Z" fill="currentColor" />
            </Box>

            <Box sx={{ position: "relative" }}>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.08 }}>
                Welcome back!
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 460, opacity: 0.95 }}>
                Sign in to manage your tank. If you’re an admin, switch to <b>Admin Login</b>.
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT FORM */}
          <Grid
            item xs={12} md={6}
            sx={{ bgcolor: "#ffffff", display: "flex", alignItems: "center", p: { xs: 3, md: 6 } }}
          >
            <Box component="form" onSubmit={onSubmit} sx={{ width: "100%", maxWidth: 460, mx: "auto" }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  mb: 1.5,
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 44, color: "text.secondary" },
                  "& .Mui-selected": { color: c.ocean },
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${c.ocean} 0%, ${c.aqua} 100%)`,
                  },
                }}
              >
                <Tab label="User Login" />
                <Tab label="Admin Login" />
                <Tab label="Seller Login" />
              </Tabs>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                {tab === 0 && "User login"}
                {tab === 1 && "Admin login"}
                {tab === 2 && "Seller login"}
              </Typography>

              {/* Tank/Staff ID — keep 'standard' but themed */}
              <TextField
                fullWidth
                variant="standard"
                placeholder={tab === 0 ? "Tank ID" : "Staff ID"}
                value={usernameOrId}
                onChange={(e) => setUsernameOrId(e.target.value)}
                sx={{
                  "& .MuiInput-underline:before": { borderBottomColor: "rgba(14,116,144,.35)" },
                  "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: c.ocean },
                  "& .MuiInput-underline:after": { borderBottomColor: c.aqua },
                  "& .MuiInputBase-input": { py: 1 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                variant="standard"
                placeholder="Password"
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                sx={{
                  mt: 2,
                  "& .MuiInput-underline:before": { borderBottomColor: "rgba(14,116,144,.35)" },
                  "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: c.ocean },
                  "& .MuiInput-underline:after": { borderBottomColor: c.aqua },
                  "& .MuiInputBase-input": { py: 1 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label="toggle password visibility">
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
                  label="Remember me"
                />
                <Box sx={{ ml: "auto" }}>
                  <Typography variant="caption" sx={{ color: c.muted }}>
                    Forgot Password?
                  </Typography>
                </Box>
              </Box>

              {/* CTA — role-based water gradients */}
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  transition: "transform .2s ease, box-shadow .2s ease, filter .2s ease",
                  background:
                    tab === 1
                      ? "linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)" // Admin: amber
                      : tab === 2
                      ? "linear-gradient(135deg,#14b8a6 0%,#67e8f9 100%)" // Seller: teal
                      : `linear-gradient(135deg, ${c.ocean} 0%, ${c.aqua} 100%)`, // User: ocean
                  boxShadow:
                    tab === 1
                      ? "0 10px 22px rgba(245,158,11,.25)"
                      : tab === 2
                      ? "0 10px 22px rgba(20,184,166,.25)"
                      : "0 10px 22px rgba(14,116,144,.25)",
                  "&:hover": { transform: "translateY(-2px)", filter: "saturate(1.05)" },
                }}
              >
                {tab === 1 ? "Login as Admin" : tab === 2 ? "Login as Seller" : "Login"}
              </Button>

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                  {error}
                </Typography>
              )}

              <Divider sx={{ my: 3 }}>or</Divider>

              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{ border: `1px solid ${c.border}`, "&:hover": { bgcolor: "#F3F4F6" } }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
