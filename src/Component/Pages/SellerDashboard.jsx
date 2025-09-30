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
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function parseSellDate(dateString) {
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  } catch (_) {
    return null;
  }
}

function derivePackageName(record) {
  const source = `${record.description || ""} ${record.capacity || ""}`.toLowerCase();
  if (source.includes("bluewave")) return "BlueWave";
  if (source.includes("aqualite")) return "AquaLite";
  if (source.includes("hydromax")) return "HydroMax";
  if (source.includes("neptune")) return "Neptune";
  if (source.includes("oceanpro")) return "OceanPro";
  return "Standard";
}

export default function SellerDashboard() {
  const [records, setRecords] = useState([]);
  const [stockBaseline, setStockBaseline] = useState(50);
  const [search, setSearch] = useState("");
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
    }));
    const totalRevenue = withPkg.reduce((sum, r) => sum + r.priceNum, 0);
    return { list: withPkg, totalRevenue };
  }, [records, monthStart, monthEnd]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return monthly.list;
    return monthly.list.filter(
      (r) =>
        r.customerName?.toLowerCase().includes(q) ||
        r.pkg?.toLowerCase().includes(q) ||
        r.tankId?.toLowerCase().includes(q)
    );
  }, [monthly.list, search]);

  const soldCount = filtered.length;
  const remainingStock = Math.max(0, (Number(stockBaseline) || 0) - soldCount);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* 🔹 Navigation Bar */}
      <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Neptune – Seller Page
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/add-tank")}
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
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* 🔹 Dashboard Content */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundImage: `
            radial-gradient(1200px 600px at -15% -20%, rgba(0, 172, 255, .14), transparent 60%),
            radial-gradient(900px 500px at 110% 0%, rgba(0, 102, 255, .12), transparent 55%),
            linear-gradient(135deg, #0d47ff 0%, #2b6cff 35%, #49a9ff 100%)
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
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Seller Dashboard
          </Typography>
          <Typography sx={{ opacity: 0.8, mt: 0.5 }}>
            Monthly overview for{" "}
            {monthStart.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </Typography>

          {/* 🔹 Stats Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#1d4fff" }}>
                      <QueryStatsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline">Tanks Sold (month)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {soldCount}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#00b894" }}>
                      <Inventory2OutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline">Stock Remaining</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {remainingStock}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#ff6a6a" }}>
                      <AttachMoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline">Total Revenue (month)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Rs. {monthly.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* 🔹 Search + Stock Baseline */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <TextField
              label="Search by customer, package, or tank ID"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Stock baseline"
              type="number"
              value={stockBaseline}
              onChange={(e) => setStockBaseline(e.target.value)}
              sx={{ minWidth: { xs: "100%", md: "200px" } }}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Stack>

          {/* 🔹 Tank Cards */}
          <Grid container spacing={2}>
            {filtered.map((tank) => (
              <Grid item xs={12} md={6} lg={4} key={tank._id || tank.tankId}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {tank.customerName}
                      </Typography>
                      <Chip
                        label={tank.pkg}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Tank: {tank.tankId}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Capacity: {tank.capacity} L
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    >
                      Price: Rs. {(Number(tank.price) || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}
