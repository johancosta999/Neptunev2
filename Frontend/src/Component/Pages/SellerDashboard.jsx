// src/Component/Pages/SellerDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  Stack,
  LinearProgress,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* -------------- helpers -------------- */
function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
function parseSellDate(dateString) {
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
function derivePackageName(record) {
  const source = `${record.description || ""} ${record.capacity || ""}`.toLowerCase();
  if (source.includes("bluewave")) return "BlueWave";
  if (source.includes("aqualite")) return "AquaLite";
  if (source.includes("hydromax")) return "HydroMax";
  if (source.includes("oceanpro")) return "OceanPro";
  if (source.includes("neptune")) return "Neptune";
  return "Standard";
}

/* -------------- style palette -------------- */
const c = {
  deep: "#0B2A3B",
  ocean: "#0E7490",
  aqua: "#38BDF8",
  mint: "#14B8A6",
  foam: "#D0F3FF",
  ink: "rgba(2,6,23,.85)",
  border: "rgba(6,32,43,.14)",
};

const hoverLift = {
  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease, filter .25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 40px rgba(2,6,23,.18)",
    filter: "saturate(1.02)",
  },
};

/* package color mapping */
const pkgColor = (name = "Standard") => {
  const n = String(name).toLowerCase();
  if (n.includes("aqualite")) return "#60A5FA"; // blue-400
  if (n.includes("hydromax")) return "#06B6D4"; // cyan-500
  if (n.includes("bluewave")) return "#3B82F6"; // blue-500
  if (n.includes("oceanpro")) return "#14B8A6"; // teal-500
  if (n.includes("neptune")) return "#0EA5E9"; // sky-500
  return "#94A3B8"; // slate-400
};

/* metric card component */
function StatCard({ icon, title, value, gradient, footer }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${c.border}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,.95) 0%, rgba(255,255,255,.90) 100%)",
        position: "relative",
        overflow: "hidden",
        ...hoverLift,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(600px 200px at 0% -10%, rgba(56,189,248,.08), transparent 40%)",
          pointerEvents: "none",
        },
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              boxShadow: "0 10px 22px rgba(0,0,0,.15)",
              background: gradient,
              border: "2px solid rgba(255,255,255,.8)",
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 0.4, color: "text.secondary" }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.25 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
        {footer}
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const [records, setRecords] = useState([]);
  const [stockBaseline, setStockBaseline] = useState(50);
  const [search, setSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sellers")
      .then((res) => setRecords(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  const { start: monthStart, end: monthEnd } = useMemo(() => monthBounds(new Date()), []);

  const monthly = useMemo(() => {
    const list = records.filter((r) => {
      const d = parseSellDate(r.sellDate);
      return d && d >= monthStart && d <= monthEnd;
    });
    const withPkg = list.map((r) => ({
      ...r,
      pkg: derivePackageName(r),
      priceNum: Number(r.price) || 0,
      d: parseSellDate(r.sellDate),
    }));
    const totalRevenue = withPkg.reduce((sum, r) => sum + r.priceNum, 0);
    return { list: withPkg, totalRevenue };
  }, [records, monthStart, monthEnd]);

  const filtered = useMemo(() => {
    let list = monthly.list;
    if (pkgFilter !== "All") list = list.filter((r) => r.pkg === pkgFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(q) ||
          r.pkg?.toLowerCase().includes(q) ||
          r.tankId?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-desc":
        list = [...list].sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
        break;
      case "price-asc":
        list = [...list].sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
        break;
      case "name":
        list = [...list].sort((a, b) =>
          (a.customerName || "").localeCompare(b.customerName || "")
        );
        break;
      default:
        list = [...list].sort((a, b) => (b.d?.getTime() || 0) - (a.d?.getTime() || 0));
    }
    return list;
  }, [monthly.list, search, pkgFilter, sortBy]);

  const soldCount = filtered.length;
  const baseline = Math.max(0, Number(stockBaseline) || 0);
  const remainingStock = Math.max(0, baseline - soldCount);
  const usedPct = baseline ? Math.min(100, Math.round((soldCount / baseline) * 100)) : 0;

  /* quick filters — static list so it doesn't flicker */
  const quickFilters = ["All", "AquaLite", "HydroMax", "BlueWave", "OceanPro", "Neptune", "Standard"];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(11,42,59,.9)",
          backdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WaterDropIcon sx={{ color: c.foam }} />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.3 }}>
              Neptune — Seller Page
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => navigate("/add-tank")}
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${c.mint} 0%, ${c.aqua} 100%)`,
                boxShadow: "0 10px 22px rgba(20,184,166,.25)",
              }}
            >
              Add Tank
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              sx={{ borderColor: "rgba(255,255,255,.6)" }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundImage: `
            radial-gradient(1200px 600px at -15% -20%, rgba(56,189,248,.16), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(20,184,166,.18), transparent 55%),
            linear-gradient(135deg, ${c.deep} 0%, ${c.ocean} 35%, ${c.aqua} 100%)
          `,
        }}
      >
        <Paper
          elevation={18}
          sx={{
            maxWidth: 1280,
            mx: "auto",
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${c.border}`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 28px 60px rgba(2,6,23,.22)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Seller Dashboard
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 0.5 }}>
            Monthly overview for{" "}
            {monthStart.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </Typography>

          {/* STATS */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<QueryStatsIcon />}
                title="Tanks sold (month)"
                value={soldCount}
                gradient="linear-gradient(135deg,#1d4fff 0%,#60a5fa 100%)"
                footer={
                  <Box sx={{ mt: 1.25 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {baseline ? `${usedPct}% of baseline sold` : "Set a baseline to track"}
                    </Typography>
                    <LinearProgress
                      variant={baseline ? "determinate" : "indeterminate"}
                      value={baseline ? usedPct : undefined}
                      sx={{
                        height: 8,
                        borderRadius: 8,
                        mt: 0.5,
                        "& .MuiLinearProgress-bar": {
                          background: "linear-gradient(90deg,#1d4fff,#60a5fa)",
                        },
                        backgroundColor: "rgba(2,6,23,.06)",
                      }}
                    />
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<Inventory2OutlinedIcon />}
                title="Stock remaining"
                value={remainingStock}
                gradient="linear-gradient(135deg,#0ea5e9 0%,#14b8a6 100%)"
                footer={
                  <Box sx={{ mt: 1.25 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Baseline: {baseline}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={baseline ? 100 - usedPct : 0}
                      sx={{
                        height: 8,
                        borderRadius: 8,
                        mt: 0.5,
                        "& .MuiLinearProgress-bar": {
                          background: "linear-gradient(90deg,#14b8a6,#67e8f9)",
                        },
                        backgroundColor: "rgba(2,6,23,.06)",
                      }}
                    />
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<AttachMoneyIcon />}
                title="Total revenue (month)"
                value={`Rs. ${monthly.totalRevenue.toLocaleString()}`}
                gradient="linear-gradient(135deg,#ef4444 0%,#fb7185 100%)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* CONTROLS */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Search by customer, package, or tank ID"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  background: "#fff",
                  "& fieldset": { borderColor: "rgba(2,6,23,.12)" },
                  "&:hover fieldset": { borderColor: c.ocean },
                  "&.Mui-focused fieldset": { borderColor: c.aqua, boxShadow: `0 0 0 2px ${c.aqua}33` },
                },
              }}
            />

            <TextField
              label="Stock baseline"
              type="number"
              value={stockBaseline}
              onChange={(e) => setStockBaseline(e.target.value)}
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", md: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 14,
                  background: "#fff",
                  "& fieldset": { borderColor: "rgba(2,6,23,.12)" },
                  "&:hover fieldset": { borderColor: c.ocean },
                  "&.Mui-focused fieldset": { borderColor: c.aqua, boxShadow: `0 0 0 2px ${c.aqua}33` },
                },
              }}
              InputProps={{ inputProps: { min: 0 } }}
            />

            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { md: "auto" } }}>
              <TuneIcon sx={{ color: "text.secondary" }} />
              <Select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  minWidth: 160,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(2,6,23,.12)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.ocean },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: c.aqua,
                    boxShadow: `0 0 0 2px ${c.aqua}33`,
                  },
                  background: "#fff",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-desc">Price: High → Low</MenuItem>
                <MenuItem value="price-asc">Price: Low → High</MenuItem>
                <MenuItem value="name">Customer A → Z</MenuItem>
              </Select>
            </Stack>
          </Stack>

          {/* QUICK FILTERS */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            {quickFilters.map((name) => {
              const active = pkgFilter === name;
              const color = name === "All" ? c.ocean : pkgColor(name);
              return (
                <Chip
                  key={name}
                  label={name}
                  onClick={() => setPkgFilter(active ? "All" : name)}
                  variant={active ? "filled" : "outlined"}
                  sx={{
                    borderRadius: 999,
                    borderColor: `${color}66`,
                    color: active ? "#fff" : color,
                    background: active ? `linear-gradient(135deg, ${color}, ${c.aqua})` : "transparent",
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Stack>

          {/* TANK CARDS */}
          <Grid container spacing={2}>
            {filtered.map((tank) => {
              const color = pkgColor(tank.pkg);
              return (
                <Grid item xs={12} md={6} lg={4} key={tank._id || tank.tankId}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: `1px solid ${c.border}`,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.9))",
                      position: "relative",
                      overflow: "hidden",
                      transformStyle: "preserve-3d",
                      ...hoverLift,
                      // gradient border glow
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: -1,
                        zIndex: 0,
                        background: `linear-gradient(135deg, ${color}55, transparent 40%)`,
                        mask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        padding: 1,
                        borderRadius: 16,
                        pointerEvents: "none",
                      },
                    }}
                  >
                    {/* left colored rail */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        background: color,
                        zIndex: 1,
                      }}
                    />
                    <CardContent sx={{ position: "relative", zIndex: 2, p: 2.25 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {tank.customerName}
                        </Typography>
                        <Chip
                          label={tank.pkg}
                          size="small"
                          sx={{
                            ml: "auto",
                            color,
                            borderColor: `${color}80`,
                            border: "1px solid",
                            background: `${color}14`,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Tank: {tank.tankId}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Capacity: {tank.capacity} L
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={`Price: Rs. ${(Number(tank.price) || 0).toLocaleString()}`}
                          sx={{
                            bgcolor: "rgba(2,6,23,.04)",
                            borderColor: "rgba(2,6,23,.12)",
                            border: "1px solid",
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {filtered.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <Typography variant="body1">No tanks match your current filters.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
