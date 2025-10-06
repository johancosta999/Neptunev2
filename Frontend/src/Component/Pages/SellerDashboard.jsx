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
  Drawer,
  IconButton,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
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
  if (source.includes("bluewave") || /(^|[^0-9])750([^0-9]|$)/.test(source)) return "BlueWave";
  if (source.includes("aqualite") || /(^|[^0-9])350([^0-9]|$)/.test(source)) return "AquaLite";
  if (source.includes("hydromax") || /(^|[^0-9])500([^0-9]|$)/.test(source)) return "HydroMax";
  if (source.includes("oceanpro") || /(^|[^0-9])1000([^0-9]|$)/.test(source)) return "OceanPro";
  if (source.includes("neptune")) return "Neptune";
  return "Standard";
}
function avatarColor() {
  return "#0ea5a0";
}
function initials(name = "") {
  const parts = (name || "").trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

export default function SellerDashboard() {
  const [records, setRecords] = useState([]);
  const [stockBaseline, setStockBaseline] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]); // multi-select
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sellers")
      .then((res) => setRecords(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  const { start: monthStart, end: monthEnd } = useMemo(() => monthBounds(new Date()), []);

  const monthly = useMemo(() => {
    const list = records
      .map((r) => ({ ...r, parsedDate: parseSellDate(r.sellDate) }))
      .filter((r) => r.parsedDate && r.parsedDate >= monthStart && r.parsedDate <= monthEnd)
      .map((r) => ({
        ...r,
        pkg: derivePackageName(r),
        priceNum: Number(r.price) || 0,
      }))
      .sort((a, b) => b.parsedDate - a.parsedDate);
    const totalRevenue = list.reduce((sum, r) => sum + r.priceNum, 0);
    return { list, totalRevenue };
  }, [records, monthStart, monthEnd]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthly.list.filter((r) => {
      const byType = selectedTypes.length === 0 ? true : selectedTypes.includes(r.pkg);
      const bySearch =
        !q ||
        r.customerName?.toLowerCase().includes(q) ||
        r.pkg?.toLowerCase().includes(q) ||
        r.tankId?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q);
      return byType && bySearch;
    });
  }, [monthly.list, search, selectedTypes]);

  const soldCount = filtered.length;
  const remainingStock = Math.max(0, (Number(stockBaseline) || 0) - soldCount);

  const toggleType = (type) => {
    setSelectedTypes((prev) => {
      if (type === "All") return [];
      return prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
    });
  };

  const openBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    setDrawerOpen(true);
  };

  const pkgOptions = ["All", "AquaLite", "HydroMax", "BlueWave", "OceanPro"];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1020" }}>
      {/* App Bar - dark gradient */}
      <AppBar
        position="sticky"
        sx={{
          background:
            "linear-gradient(135deg, #052e2b 0%, #0b4c46 40%, #0f766e 100%)",
          boxShadow: "0 8px 22px rgba(0,0,0,.35)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Neptune – Seller Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#10b981",
                color: "#061519",
                fontWeight: 800,
                "&:hover": { bgcolor: "#0ea36d" },
              }}
              onClick={() => navigate("/add-tank")}
            >
              Add Tank
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              sx={{
                borderColor: "rgba(255,255,255,.35)",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.06)" },
              }}
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Page background */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background:
            "radial-gradient(1200px 600px at -15% -20%, rgba(16,185,129,.12), transparent 60%)," +
            "radial-gradient(900px 500px at 110% 0%, rgba(99,102,241,.10), transparent 55%)," +
            "linear-gradient(135deg, #0b1020 0%, #0c1b1b 40%, #0d1b2a 100%)",
        }}
      >
        {/* Main panel - frosted dark */}
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1280,
            mx: "auto",
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            background: "rgba(17,24,39,0.72)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
            color: "#e5e7eb",
          }}
        >
          {/* Header */}
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#f1f5f9" }}>
            Seller Dashboard
          </Typography>
          <Typography sx={{ opacity: 0.75, mt: 0.5 }}>
            Monthly overview for{" "}
            {monthStart.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </Typography>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  bgcolor: "rgba(2,6,23,.6)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(148,163,184,.18)",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#0ea5a0" }}>
                      <QueryStatsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" sx={{ color: "#93c5fd" }}>
                        Tanks Sold (month)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#f8fafc" }}>
                        {soldCount}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  bgcolor: "rgba(2,6,23,.6)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(148,163,184,.18)",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#10b981" }}>
                      <Inventory2OutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" sx={{ color: "#a7f3d0" }}>
                        Stock Remaining
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#f8fafc" }}>
                        {remainingStock}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  bgcolor: "rgba(2,6,23,.6)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(148,163,184,.18)",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#ef4444" }}>
                      <AttachMoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" sx={{ color: "#fecaca" }}>
                        Total Revenue (month)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#f8fafc" }}>
                        Rs. {monthly.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: "rgba(148,163,184,.18)" }} />

          {/* Controls */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Search by customer, package, tank ID, or city"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "rgba(2,6,23,.6)",
                  color: "#e5e7eb",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(148,163,184,.25)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(203,213,225,.5)",
                  },
                },
                "& .MuiInputLabel-root": { color: "rgba(226,232,240,.7)" },
              }}
            />
            <TextField
              label="Stock baseline"
              type="number"
              value={stockBaseline}
              onChange={(e) => setStockBaseline(e.target.value)}
              sx={{
                minWidth: { xs: "100%", md: 200 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "rgba(2,6,23,.6)",
                  color: "#e5e7eb",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(148,163,184,.25)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(203,213,225,.5)",
                  },
                },
                "& .MuiInputLabel-root": { color: "rgba(226,232,240,.7)" },
              }}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Stack>

          {/* Type filters */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            {["All", "AquaLite", "HydroMax", "BlueWave", "OceanPro"].map((p) => {
              const active =
                p === "All" ? selectedTypes.length === 0 : selectedTypes.includes(p);
              return (
                <Chip
                  key={p}
                  label={p}
                  onClick={() => toggleType(p)}
                  clickable
                  variant={active ? "filled" : "outlined"}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    color: active ? "#a7f3d0" : "#e5e7eb",
                    bgcolor: active ? "rgba(16,185,129,.18)" : "rgba(255,255,255,.04)",
                    borderColor: active ? "rgba(16,185,129,.4)" : "rgba(148,163,184,.25)",
                    "&:hover": {
                      bgcolor: active ? "rgba(16,185,129,.26)" : "rgba(255,255,255,.07)",
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* Tanks list */}
          <Stack spacing={1.5}>
            {filtered.map((tank) => (
              <Card
                key={tank._id || tank.tankId}
                sx={{
                  borderRadius: 2,
                  bgcolor: "rgba(2,6,23,.55)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(148,163,184,.18)",
                  "&:hover": {
                    boxShadow: "0 10px 26px rgba(0,0,0,.35)",
                    borderColor: "rgba(16,185,129,.45)",
                  },
                  cursor: "pointer",
                }}
                onClick={() => openBuyer(tank)}
              >
                <CardContent sx={{ py: 1.25 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: avatarColor(), color: "#052e2b" }}>
                        {initials(tank.customerName).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#f1f5f9" }}>
                          {tank.customerName || "—"}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                          <Chip
                            label={tank.pkg}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1.5,
                              fontWeight: 700,
                              color: "#a7f3d0",
                              borderColor: "rgba(16,185,129,.45)",
                              bgcolor: "rgba(16,185,129,.12)",
                            }}
                          />
                          <Typography variant="body2" sx={{ color: "rgba(226,232,240,.75)" }}>
                            Tank: <b style={{ color: "#e5e7eb" }}>{tank.tankId}</b> • {tank.capacity}L
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Typography variant="body2" sx={{ color: "rgba(226,232,240,.7)" }}>
                        {tank.parsedDate ? tank.parsedDate.toLocaleDateString() : ""}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#f1f5f9" }}>
                        Rs. {(Number(tank.price) || 0).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  borderStyle: "dashed",
                  color: "rgba(226,232,240,.75)",
                  bgcolor: "rgba(2,6,23,.5)",
                  borderColor: "rgba(148,163,184,.25)",
                }}
              >
                No tanks match the current filters.
              </Paper>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Buyer details drawer - dark */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: "rgba(17,24,39,0.96)",
            color: "#e5e7eb",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#f1f5f9" }}>
              Buyer Details
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#e5e7eb" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {selectedBuyer ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: avatarColor(), width: 48, height: 48, color: "#052e2b" }}>
                  {initials(selectedBuyer.customerName).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#f1f5f9" }}>
                    {selectedBuyer.customerName || "—"}
                  </Typography>
                  <Chip
                    label={selectedBuyer.pkg}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 700,
                      color: "#a7f3d0",
                      borderColor: "rgba(16,185,129,.45)",
                      bgcolor: "rgba(16,185,129,.12)",
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ borderColor: "rgba(148,163,184,.18)" }} />

              <Stack spacing={1}>
                <Row k="Tank ID" v={selectedBuyer.tankId} />
                <Row k="Capacity" v={`${selectedBuyer.capacity} L`} />
                <Row k="Price" v={`Rs. ${(Number(selectedBuyer.price) || 0).toLocaleString()}`} />
                <Row k="Warranty" v={`${selectedBuyer.warranty || "—"} years`} />
                <Row
                  k="Sell Date"
                  v={
                    selectedBuyer.sellDate
                      ? new Date(selectedBuyer.sellDate).toLocaleDateString()
                      : "—"
                  }
                />
              </Stack>

              <Divider sx={{ borderColor: "rgba(148,163,184,.18)" }} />

              <Stack spacing={1}>
                <Row k="Email" v={selectedBuyer.customerEmail} />
                <Row k="Contact" v={selectedBuyer.contactNumber} />
                <Row k="Address" v={selectedBuyer.address} />
                <Row k="City" v={selectedBuyer.city} />
                <Row k="Notes" v={selectedBuyer.description} />
              </Stack>

              <Divider sx={{ borderColor: "rgba(148,163,184,.18)" }} />

              <Button
                variant="contained"
                sx={{
                  bgcolor: "#10b981",
                  color: "#03221f",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#0ea36d" },
                }}
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </Button>
            </Stack>
          ) : (
            <Typography sx={{ mt: 2, color: "rgba(226,232,240,.75)" }}>
              Select a buyer from the list to see details.
            </Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

/* Simple key:value row for drawer */
function Row({ k, v }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: "rgba(226,232,240,.7)" }}>
        {k}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#f8fafc" }}>
        {v || "—"}
      </Typography>
    </Stack>
  );
}
