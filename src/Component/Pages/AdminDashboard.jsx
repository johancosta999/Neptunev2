// src/Component/Pages/AdminDashboard.jsx
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AdminShell from "./AdminShell";

// Icons
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const GUTTER = 3;

const Card = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: 0,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const CardHeader = ({ title, action }) => (
  <Box
    sx={{
      px: 2.5,
      py: 2,
      borderBottom: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 18 }}>
        {title}
      </Typography>
      {action}
    </Stack>
  </Box>
);

const CardBody = ({ children, sx }) => (
  <Box sx={{ px: 2.5, py: 2.25, ...sx }}>{children}</Box>
);

const KPITile = ({ icon, label, value, sub, color = "#1e63ff", bg }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      height: 126,
      display: "flex",
      alignItems: "center",
      border: "1px solid",
      borderColor: "divider",
      background: bg || "linear-gradient(180deg,#fff,#f6f9ff)",
      boxShadow: "0 2px 8px rgba(16,24,40,0.04)",
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
      <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: color, color: "#fff" }}>
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  // demo numbers (wire to API later)
  const kpi = {
    totalOrders: 318,
    pending: 42,
    revenue: 86500,
    aov: 272.15,
    refunds: 3,
    lowStock: 5,
    fulfilmentRate: 91,
    onTimeDispatch: 87,
  };

  const recent = [
    { id: "#2633", name: "Brooklyn Zoe", address: "302 Tinder St, VT 05701", date: "31 Jul 2020", price: "$44", status: "Pending" },
    { id: "#2634", name: "John McCormick", address: "1096 Wiseman St, CA 52532", date: "01 Aug 2020", price: "$35", status: "Dispatch" },
    { id: "#2635", name: "Sandra Pugh", address: "Thorn St, GA 39870", date: "02 Aug 2020", price: "$42", status: "Completed" },
    { id: "#2636", name: "Vernie Hart", address: "5th Drive, DE 19062", date: "02 Aug 2020", price: "$82", status: "Pending" },
  ];
  const statusColor = (s) =>
    s === "Completed" ? "success" : s === "Dispatch" ? "primary" : "warning";

  const lowStock = [
    { sku: "SEN-12", name: "Level Sensor", stock: 0 },
    { sku: "FLT-01", name: "Inline Filter", stock: 3 },
    { sku: "VAL-10", name: '1" Valve', stock: 4 },
  ];

  const offers = [
    { code: "NEW10", title: "New user 10% OFF", status: "Active", until: "31 Dec 2025" },
    { code: "SUMMER", title: "Summer promo", status: "Scheduled", until: "01 Nov 2025" },
  ];
  const offerColor = (s) => (s === "Active" ? "success" : s === "Scheduled" ? "info" : "default");

  return (
    <AdminShell title="Dashboard">
      {/* Center everything and give the page breathing room */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Row 1 — KPI tiles */}
        <Grid container spacing={GUTTER} sx={{ mb: 0.5 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<ShoppingCartOutlinedIcon />}
              label="Total Orders"
              value={kpi.totalOrders.toLocaleString()}
              sub="All time orders"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<PendingActionsOutlinedIcon />}
              label="Pending Orders"
              value={kpi.pending}
              sub="Needs attention"
              color="#ff8a00"
              bg="linear-gradient(180deg,#fff,#fff6e9)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<AttachMoneyOutlinedIcon />}
              label="Monthly Revenue"
              value={kpi.revenue.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              sub="This month"
              color="#16a34a"
              bg="linear-gradient(180deg,#fff,#effaf1)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<TrendingUpOutlinedIcon />}
              label="Avg Order Value"
              value={kpi.aov.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              sub="Rolling 30 days"
              color="#0ea5e9"
              bg="linear-gradient(180deg,#fff,#eef9ff)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<ReplayOutlinedIcon />}
              label="Refunds"
              value={kpi.refunds}
              sub="Last 30 days"
              color="#a855f7"
              bg="linear-gradient(180deg,#fff,#f7efff)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <KPITile
              icon={<Inventory2OutlinedIcon />}
              label="Low Stock Items"
              value={kpi.lowStock}
              sub="< 5 units"
              color="#ef4444"
              bg="linear-gradient(180deg,#fff,#ffefef)"
            />
          </Grid>
        </Grid>

        {/* Row 2 — Operations (8) + Offers (4) */}
        <Grid container spacing={GUTTER} sx={{ mb: 0.5 }}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Operations Health" />
              <CardBody>
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fulfilment Rate
                      </Typography>
                      <Typography variant="subtitle2">{kpi.fulfilmentRate}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={kpi.fulfilmentRate}
                      color={kpi.fulfilmentRate > 90 ? "success" : kpi.fulfilmentRate > 75 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        On-time Dispatch
                      </Typography>
                      <Typography variant="subtitle2">{kpi.onTimeDispatch}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={kpi.onTimeDispatch}
                      color={kpi.onTimeDispatch > 90 ? "success" : kpi.onTimeDispatch > 75 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  sx={{ mt: 2.25 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={() => navigate("/admin/products")}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Product
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocalOfferOutlinedIcon />}
                    onClick={() => navigate("/admin/offers")}
                    sx={{ borderRadius: 2 }}
                  >
                    Create Offer
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptLongOutlinedIcon />}
                    onClick={() => navigate("/admin/orders")}
                    sx={{ borderRadius: 2 }}
                  >
                    View Orders
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </Grid>

          <Link to ={"/tanks"}>
            <button>Home</button>
          </Link>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Latest Offers" />
              <CardBody sx={{ pt: 1 }}>
                <Stack spacing={1.25}>
                  {offers.map((o) => (
                    <Box
                      key={o.code}
                      sx={{
                        p: 1.25,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {o.title}
                        </Typography>
                        <Chip size="small" label={o.status} color={offerColor(o.status)} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Code: {o.code} · Valid until {o.until}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Grid>
        </Grid>

        {/* Row 3 — Recent Orders (8) + Low-stock (4) */}
        <Grid container spacing={GUTTER}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Recent Orders" />
              <CardBody sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
                      <TableCell width={100}>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell width={140}>Date</TableCell>
                      <TableCell align="right" width={100}>
                        Price
                      </TableCell>
                      <TableCell align="center" width={120}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ width: 26, height: 26 }}>
                              {r.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </Avatar>
                            {r.name}
                          </Stack>
                        </TableCell>
                        <TableCell>{r.address}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell align="right">{r.price}</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={r.status} color={statusColor(r.status)} variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Low-stock Alerts" />
              <CardBody sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
                      <TableCell>SKU</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell align="right" width={80}>
                        Stock
                      </TableCell>
                      <TableCell align="center" width={120}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStock.map((r) => (
                      <TableRow key={r.sku} hover>
                        <TableCell>{r.sku}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell align="right">{r.stock}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={r.stock <= 0 ? "Out of Stock" : "Low Stock"}
                            color={r.stock <= 0 ? "error" : "warning"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AdminShell>
  );
}