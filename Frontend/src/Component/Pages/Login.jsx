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
  Chip,
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

/* ---------- Role themes (3 distinct styles) ---------- */
const THEMES = {
  0: {
    // USER
    name: "User",
    deep: "#0B2A3B",
    primary: "#0E7490",
    accent: "#38BDF8",
    hero1: "rgba(56,189,248,.95)",
    hero2: "rgba(20,184,166,.85)",
    hero3: "rgba(14,116,144,.95)",
    button: "linear-gradient(135deg,#0E7490 0%,#38BDF8 100%)",
    shadow: "0 10px 22px rgba(14,116,144,.25)",
    text: "#0f172a",
    muted: "rgba(15,23,42,.70)",
  },
  1: {
    // ADMIN
    name: "Admin",
    deep: "#3F1D0B",
    primary: "#B45309",
    accent: "#F59E0B",
    hero1: "rgba(245,158,11,.95)",
    hero2: "rgba(251,146,60,.85)",
    hero3: "rgba(180,83,9,.95)",
    button: "linear-gradient(135deg,#D97706 0%,#F59E0B 100%)",
    shadow: "0 10px 22px rgba(245,158,11,.25)",
    text: "#0f172a",
    muted: "rgba(15,23,42,.70)",
  },
  2: {
    // SELLER
    name: "Seller",
    deep: "#064E3B",
    primary: "#059669",
    accent: "#34D399",
    hero1: "rgba(52,211,153,.95)",
    hero2: "rgba(110,231,183,.85)",
    hero3: "rgba(5,150,105,.95)",
    button: "linear-gradient(135deg,#10B981 0%,#6EE7B7 100%)",
    shadow: "0 10px 22px rgba(16,185,129,.25)",
    text: "#0f172a",
    muted: "rgba(15,23,42,.70)",
  },
};

/* ---------- helper: underline-only inputs (kills rounded outline) ---------- */
const underlineOnly = (primary, accent) => ({
  "& .MuiInputBase-root, & .MuiInput-root": {
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
  },
  "& input": {
    border: "none !important",
    borderRadius: "0 !important",
    outline: "none !important",
    background: "transparent !important",
  },
  "& .MuiInput-underline:before": { borderBottomColor: `${primary}55` },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottomColor: primary,
  },
  "& .MuiInput-underline:after": { borderBottomColor: accent },
  "& .MuiInputBase-input": { py: 1 },
});

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

  const T = THEMES[tab] || THEMES[0];

  useEffect(() => {
    axios.get("http://localhost:5000/api/sellers")
      .then((res) => setUserRecords(res.data.data || []))
      .catch(console.log);

    axios.get("http://localhost:5000/api/staffs")
      .then((res) => setStaffRecords(res.data.data || []))
      .catch(console.log);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (tab === 1) {
      const staff = staffRecords.find(s => s.id === usernameOrId && s.password === pw);
      if (staff) { localStorage.setItem("admin", JSON.stringify(staff)); navigate("/tanks", { replace: true }); }
      else setError("Invalid Staff ID or Password");
    } else if (tab === 2) {
      const staff = staffRecords.find(s => s.id === usernameOrId && s.password === pw);
      if (staff) { localStorage.setItem("sellerStaff", JSON.stringify(staff)); navigate("/seller/dashboard", { replace: true }); }
      else setError("Invalid Staff ID or Password");
    } else {
      const tank = userRecords.find(t => t.tankId === usernameOrId && t.password === pw);
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
        background: `
          radial-gradient(1200px 600px at -15% -20%, ${T.accent}22, transparent 60%),
          radial-gradient(900px 500px at 110% 0%, ${T.primary}26, transparent 55%),
          linear-gradient(135deg, ${T.deep} 0%, ${T.primary} 45%, ${T.accent} 100%)
        `,
      }}
    >
      <GlobalStyles
        styles={{
          "#auth-login input::-ms-reveal, #auth-login input::-ms-clear, #auth-login input::-webkit-search-cancel-button": {
            display: "none !important",
          },
          "input:-webkit-autofill, input:-webkit-autofill:focus": {
            transition: "background-color 600000s 0s, color 600000s 0s",
          },
        }}
      />

      <Paper
        elevation={18}
        sx={{
          width: "100%",
          maxWidth: 1180,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(0,0,0,.22)",
          bgcolor: "background.paper",
          border: "1px solid rgba(0,0,0,.06)",
        }}
      >
        <Grid container sx={{ minHeight: { xs: 0, md: 620 } }}>
          {/* LEFT HERO — themed & forced to win over any global whites */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 4, md: 6 },
              color: "#fff",
              position: "relative",
              backgroundColor: "transparent !important",
              backgroundImage: "none !important",
              background:
                `
                  radial-gradient(closest-side at 22% 22%, ${T.hero1}, transparent 58%),
                  radial-gradient(closest-side at 78% 16%, ${T.hero2}, transparent 56%),
                  radial-gradient(closest-side at 64% 86%, ${T.hero3}, transparent 60%),
                  linear-gradient(135deg, ${T.deep} 0%, ${T.primary} 58%, ${T.accent} 110%)
                ` + " !important",
              backgroundRepeat: "no-repeat",
              backgroundSize: "140% 140%",
              minHeight: { xs: 260, md: 620 },
            }}
          >
            {/* soft wave (inline SVG, no image) */}
            <Box
              component="svg"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 120,
                color: "rgba(255,255,255,.18)",
                pointerEvents: "none",
              }}
            >
              <path
                d="M0,72 C280,120 560,16 840,42 C1120,68 1280,50 1440,24 L1440,120 L0,120 Z"
                fill="currentColor"
              />
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

          {/* RIGHT FORM — themed & high-contrast on white */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              p: { xs: 3, md: 6 },
              color: T.text,
            }}
          >
            <Box
              component="form"
              onSubmit={onSubmit}
              sx={{
                width: "100%",
                maxWidth: 460,
                mx: "auto",
                color: T.text,
                "& .MuiTypography-root": { color: T.text },
                "& .MuiSvgIcon-root": { color: T.muted },
                "& .MuiInputBase-input": { color: T.text },
                "& input::placeholder": { color: T.muted, opacity: 1 },
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  mb: 1.5,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    minHeight: 44,
                    color: T.muted,
                  },
                  "& .Mui-selected": { color: T.primary },
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${T.primary} 0%, ${T.accent} 100%)`,
                  },
                }}
              >
                <Tab label="User Login" />
                <Tab label="Admin Login" />
                <Tab label="Seller Login" />
              </Tabs>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {tab === 0 && "User login"}
                  {tab === 1 && "Admin login"}
                  {tab === 2 && "Seller login"}
                </Typography>
                <Chip
                  size="small"
                  label={`${T.name} mode`}
                  sx={{
                    height: 22,
                    color: T.primary,
                    background: `${T.accent}22`,
                    border: `1px solid ${T.primary}33`,
                  }}
                />
              </Box>

              {/* ID field — underline only (no rounded outline) */}
              <TextField
                fullWidth
                variant="standard"
                placeholder={tab === 0 ? "Tank ID" : "Staff ID"}
                value={usernameOrId}
                onChange={(e) => setUsernameOrId(e.target.value)}
                sx={underlineOnly(T.primary, T.accent)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password — underline only (no rounded outline) */}
              <TextField
                fullWidth
                variant="standard"
                placeholder="Password"
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                sx={{ mt: 2, ...underlineOnly(T.primary, T.accent) }}
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
                  <Typography variant="caption" sx={{ color: T.muted }}>
                    Forgot Password?
                  </Typography>
                </Box>
              </Box>

              {/* Submit */}
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
                  background: T.button,
                  boxShadow: T.shadow,
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

              <Divider sx={{ my: 3, borderColor: "#ececec" }}>or</Divider>

              {/* Socials */}
              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      border: `1px solid ${T.primary}22`,
                      color: T.primary,
                      "&:hover": { bgcolor: `${T.accent}18` },
                    }}
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
