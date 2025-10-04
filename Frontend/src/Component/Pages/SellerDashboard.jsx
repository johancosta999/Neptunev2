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

/* ---------- helpers ---------- */
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
const initials = (name = "") =>
  name.trim().length ? name.trim().split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase() : "•";

/* ---------- Seller (green) theme ---------- */
const g = {
  deep: "#064E3B",
  primary: "#059669",
  accent: "#34D399",
  mint: "#6EE7B7",
  light: "#F5FBF8",
  ink: "rgba(2,6,23,.92)",
  hair: "rgba(2,6,23,.10)",
  border: "rgba(5,150,105,.22)",
};

const hoverLift = {
  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease, filter .25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 24px 40px rgba(2,6,23,.16)",
    filter: "saturate(1.03)",
  },
};

const pkgColor = (name = "Standard") => {
  const n = String(name).toLowerCase();
  if (n.includes("aqualite")) return "#60A5FA";
  if (n.includes("hydromax")) return "#06B6D4";
  if (n.includes("bluewave")) return "#3B82F6";
  if (n.includes("oceanpro")) return "#14B8A6";
  if (n.includes("neptune")) return "#0EA5E9";
  return "#94A3B8";
};

/* ---------- atoms ---------- */
function StatCard({ icon, title, value, gradient, footer }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 16,
        border: `1px solid ${g.border}`,
        background: "linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.90))",
        position: "relative",
        overflow: "hidden",
        ...hoverLift,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              border: "2px solid rgba(255,255,255,.85)",
              background: gradient,
              boxShadow: "0 10px 22px rgba(0,0,0,.12)",
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

/* ---------- view ---------- */
export default function SellerDashboard() {
  const [records, setRecords] = useState([]);
  const [stockBaseline, setStockBaseline] = useState(50);
  const [search, setSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/sellers")
      .then((res) => setRecords(res.data.data || []))
      .catch(console.log);
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
      case "price-desc": list = [...list].sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0)); break;
      case "price-asc":  list = [...list].sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0)); break;
      case "name":       list = [...list].sort((a, b) => (a.customerName || "").localeCompare(b.customerName || "")); break;
      default:           list = [...list].sort((a, b) => (b.d?.getTime() || 0) - (a.d?.getTime() || 0));
    }
    return list;
  }, [monthly.list, search, pkgFilter, sortBy]);

  const soldCount = filtered.length;
  const baseline = Math.max(0, Number(stockBaseline) || 0);
  const remainingStock = Math.max(0, baseline - soldCount);
  const usedPct = baseline ? Math.min(100, Math.round((soldCount / baseline) * 100)) : 0;

  const quickFilters = ["All", "AquaLite", "HydroMax", "BlueWave", "OceanPro", "Neptune", "Standard"];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: g.light }}>
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(6,78,59,.94)",
          backdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WaterDropIcon sx={{ color: g.mint }} />
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
                background: `linear-gradient(135deg, ${g.primary} 0%, ${g.mint} 100%)`,
                boxShadow: "0 10px 22px rgba(16,185,129,.25)",
              }}
            >
              Add Tank
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => { localStorage.clear(); navigate("/"); }}
              sx={{ borderColor: "rgba(255,255,255,.6)" }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* PAGE BG */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundImage: `
            radial-gradient(1200px 600px at -15% -20%, ${g.mint}2A, transparent 60%),
            radial-gradient(900px 500px at 110% 0%, ${g.primary}30, transparent 55%),
            linear-gradient(135deg, ${g.deep} 0%, ${g.primary} 38%, ${g.accent} 100%)
          `,
        }}
      >
        {/* GLASS CONTAINER */}
        <Paper
          elevation={18}
          sx={{
            maxWidth: 1400,
            mx: "auto",
            borderRadius: 24,
            p: { xs: 2, md: 4 },
            background: "rgba(255,255,255,.96)",
            border: `1px solid ${g.border}`,
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

          {/* KPIs */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<QueryStatsIcon />}
                title="Tanks sold (month)"
                value={soldCount}
                gradient="linear-gradient(135deg,#10B981 0%,#34D399 100%)"
                footer={
                  <Box sx={{ mt: 1.25 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {baseline ? `${usedPct}% of baseline sold` : "Set a baseline to track"}
                    </Typography>
                    <LinearProgress
                      variant={baseline ? "determinate" : "indeterminate"}
                      value={baseline ? usedPct : undefined}
                      sx={{
                        height: 8, borderRadius: 8, mt: 0.5,
                        "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#10B981,#6EE7B7)" },
                        backgroundColor: g.hair,
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
                gradient="linear-gradient(135deg,#059669 0%,#34D399 100%)"
                footer={
                  <Box sx={{ mt: 1.25 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Baseline: {baseline}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={baseline ? 100 - usedPct : 0}
                      sx={{
                        height: 8, borderRadius: 8, mt: 0.5,
                        "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#22C55E,#A7F3D0)" },
                        backgroundColor: g.hair,
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
                gradient="linear-gradient(135deg,#22C55E 0%,#86EFAC 100%)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* CONTROLS (fixed: rectangular, single border) */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ mb: 2 }}
          >
            <TextField
              autoComplete="off"
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
                // kill any native borders/appearance that can create inner lines
                inputProps: {
                  style: { border: "0", outline: "0", boxShadow: "none", WebkitAppearance: "none" },
                },
                sx: {
                  height: 52,
                  borderRadius: "8px !important",                      // force rectangular
                  background: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {               // the real outline element
                    borderColor: `${g.hair} !important`,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${g.primary} !important`,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${g.accent} !important`,
                    boxShadow: `0 0 0 2px ${g.accent}55`,
                  },
                  "& input": { border: "0 !important", outline: "none !important", boxShadow: "none !important" },
                },
              }}
              sx={{
                "& .MuiInputLabel-root": { fontWeight: 700 },
              }}
            />

            <TextField
              label="Stock baseline"
              type="number"
              value={stockBaseline}
              onChange={(e) => setStockBaseline(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  height: 52,
                  borderRadius: "8px !important",
                  background: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: `${g.hair} !important` },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: `${g.primary} !important` },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${g.accent} !important`,
                    boxShadow: `0 0 0 2px ${g.accent}55`,
                  },
                  "& input": { border: "0 !important", outline: "none !important", boxShadow: "none !important" },
                },
              }}
              sx={{ minWidth: { xs: "100%", md: 230 } }}
            />

            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { md: "auto" } }}>
              <TuneIcon sx={{ color: "text.secondary" }} />
              <Select
                size="medium"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  minWidth: 170,
                  height: 52,
                  background: "#fff",
                  borderRadius: "8px !important",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: `${g.hair} !important` },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: `${g.primary} !important` },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: `${g.accent} !important`,
                    boxShadow: `0 0 0 2px ${g.accent}55`,
                  },
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
            {["All", "AquaLite", "HydroMax", "BlueWave", "OceanPro", "Neptune", "Standard"].map((name) => {
              const active = pkgFilter === name;
              const color = name === "All" ? g.primary : pkgColor(name);
              return (
                <Chip
                  key={name}
                  label={name}
                  onClick={() => setPkgFilter(active ? "All" : name)}
                  variant={active ? "filled" : "outlined"}
                  sx={{
                    borderRadius: 8,
                    borderColor: `${color}66`,
                    color: active ? "#0b3b2b" : color,
                    background: active
                      ? `linear-gradient(135deg, ${g.primary} 0%, ${g.mint} 100%)`
                      : "transparent",
                    fontWeight: 600,
                    height: 30,
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
                      minHeight: 190,
                      borderRadius: 16,
                      border: `1px solid ${g.border}`,
                      background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.92))",
                      position: "relative",
                      overflow: "hidden",
                      ...hoverLift,
                    }}
                  >
                    <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: color, zIndex: 1 }} />
                    <CardContent sx={{ position: "relative", zIndex: 2, p: 2.25 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}22`, color, fontWeight: 800 }}>
                          {initials(tank.customerName)}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 900, mr: "auto" }}>
                          {tank.customerName}
                        </Typography>
                        <Chip
                          label={tank.pkg}
                          size="small"
                          sx={{
                            color,
                            borderColor: `${color}80`,
                            border: "1px solid",
                            background: `${color}14`,
                            fontWeight: 700,
                            borderRadius: 8,
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" sx={{ opacity: 0.85 }}>Tank: {tank.tankId}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>Capacity: {tank.capacity} L</Typography>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={`Price: Rs. ${(Number(tank.price) || 0).toLocaleString()}`}
                          sx={{
                            bgcolor: "rgba(2,6,23,.04)",
                            borderColor: "rgba(2,6,23,.12)",
                            border: "1px solid",
                            fontWeight: 700,
                            borderRadius: 8,
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
