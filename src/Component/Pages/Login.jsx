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
    axios
      .get("http://localhost:5000/api/sellers")
      .then((res) => setUserRecords(res.data.data || []))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/api/staffs")
      .then((res) => setStaffRecords(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (tab === 1) {
      // Admin login using Staff ID + Password
      const staff = staffRecords.find(
        (s) => s.id === usernameOrId && s.password === pw
      );
      if (staff) {
        localStorage.setItem("admin", JSON.stringify(staff));
        navigate("/tanks", { replace: true });
      } else {
        setError("Invalid Staff ID or Password");
      }
    } else if (tab === 2) {
      // Seller login using Staff ID + Password
      const staff = staffRecords.find(
        (s) => s.id === usernameOrId && s.password === pw
      );
      if (staff) {
        localStorage.setItem("sellerStaff", JSON.stringify(staff));
        navigate("/seller/dashboard", { replace: true });
      } else {
        setError("Invalid Staff ID or Password");
      }
    } else {
      const tank = userRecords.find(
        (t) => t.tankId === usernameOrId && t.password === pw
      );
      if (tank) {
        localStorage.setItem("tankId", tank.tankId);
        localStorage.setItem("loggedTank", JSON.stringify(tank));
        navigate("/homepage", { replace: true });
      } else {
        setError("Invalid Tank ID or Password");
      }
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
        backgroundImage: `
          radial-gradient(1200px 600px at -15% -20%, rgba(0, 172, 255, .20), transparent 60%),
          radial-gradient(900px 500px at 110% 0%, rgba(0, 102, 255, .18), transparent 55%),
          linear-gradient(135deg, #0d47ff 0%, #2b6cff 35%, #49a9ff 100%)
        `,
      }}
    >
      <GlobalStyles
        styles={{
          "#auth-login input::-ms-reveal, #auth-login input::-ms-clear, #auth-login input::-webkit-search-cancel-button": {
            display: "none !important",
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
          boxShadow: "0 28px 90px rgba(13,71,255,0.28)",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Grid container sx={{ minHeight: { xs: 0, md: 620 } }}>
          {/* Left hero */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 4, md: 6 },
              color: "#fff",
              background:
                "linear-gradient(135deg, #1d4fff 0%, #2f6bff 40%, #55c0ff 100%)",
              position: "relative",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.08 }}>
                Welcome back!
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 440, opacity: 0.95 }}>
                Sign in to manage your tank. If you’re an admin, switch to{" "}
                <b>Admin Login</b>.
              </Typography>
            </Box>
          </Grid>

          {/* Right form */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "center",
              p: { xs: 3, md: 6 },
            }}
          >
            <Box
              component="form"
              onSubmit={onSubmit}
              sx={{ width: "100%", maxWidth: 440, mx: "auto" }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
                  mb: 1.5,
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

              {/* Tank ID / Staff ID input */}
              <TextField
                fullWidth
                variant="standard"
                placeholder={tab === 0 ? "Tank ID" : "Staff ID"}
                value={usernameOrId}
                onChange={(e) => setUsernameOrId(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password input */}
              <TextField
                fullWidth
                variant="standard"
                placeholder="Password"
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end">
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                  />
                }
                label="Remember me"
              />

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
                  background:
                    tab === 1
                      ? "linear-gradient(135deg,#ff6a6a 0%,#ffa36b 100%)"
                      : tab === 2
                        ? "linear-gradient(135deg,#00b894 0%,#55efc4 100%)"
                        : "linear-gradient(135deg,#1d4fff 0%,#44a0ff 100%)",
                  boxShadow:
                    tab === 1
                      ? "0 10px 22px rgba(255,106,106,0.25)"
                      : tab === 2
                        ? "0 10px 22px rgba(0,184,148,0.25)"
                        : "0 10px 22px rgba(29,79,255,0.25)",
                }}
              >
                {tab === 1 ? "Login as Admin" : tab === 2 ? "Login as Seller" : "Login"}
              </Button>

              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ mt: 1, textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}

              {/* Signup section removed per requirements */}

              <Divider sx={{ my: 3 }}>or</Divider>

              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                <IconButton size="small">
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
