import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
} from "@mui/material";
import AdminShell from "./AdminShell";

import OpacityIcon from "@mui/icons-material/Opacity";
import AvTimerIcon from "@mui/icons-material/AvTimer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip as RTooltip,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ----------------------------- helpers / UI ----------------------------- */

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
  <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
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

const KPITile = ({ icon, label, value, suffix = "%", progress, color = "primary" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      height: 126,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 2px 8px rgba(16,24,40,0.04)",
    }}
  >
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar variant="rounded" color={color} sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>
          {value}
          {suffix}
        </Typography>
        {typeof progress === "number" && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(0,0,0,0.06)" }}
          />
        )}
      </Stack>
    </Stack>
  </Paper>
);

/* ------------------------------- demo data ------------------------------ */
// You can replace these with your API data later.

const ALL_TANKS = ["All Tanks", "Tank A", "Tank B", "Tank C"];

const usageSeries = [
  { day: "Mon", usage: 62 },
  { day: "Tue", usage: 68 },
  { day: "Wed", usage: 71 },
  { day: "Thu", usage: 66 },
  { day: "Fri", usage: 74 },
  { day: "Sat", usage: 69 },
  { day: "Sun", usage: 72 },
];

const uptimeByTank = [
  { tank: "Tank A", uptime: 99 },
  { tank: "Tank B", uptime: 97 },
  { tank: "Tank C", uptime: 95 },
  { tank: "Tank D", uptime: 96 },
];

const qualityMix = [
  { name: "Excellent", value: 62, color: "#16a34a" },
  { name: "Good", value: 28, color: "#3b82f6" },
  { name: "Fair", value: 8, color: "#f59e0b" },
  { name: "Poor", value: 2, color: "#ef4444" },
];

const alerts = [
  { ts: "2025-09-18 10:04", tank: "Tank B", type: "TDS Spike", sev: "Critical" },
  { ts: "2025-09-18 08:22", tank: "Tank D", type: "pH Out of Range", sev: "Warning" },
  { ts: "2025-09-17 22:11", tank: "Tank C", type: "Sensor Offline", sev: "Info" },
];

/* ---------------------------- CSV export helper ------------------------- */
function exportUsageCSV(rows) {
  const header = "day,usage";
  const body = rows.map((r) => `${r.day},${r.usage}`).join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "usage_over_time.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------------------- page -------------------------------- */
export default function AdminStatistics() {
  const [range, setRange] = useState("7d");
  const [tank, setTank] = useState(ALL_TANKS[0]);

  const filteredUsage = useMemo(() => {
    // In a real app, filter by range and tank here (or request server-side)
    return usageSeries;
  }, [range, tank]);

  return (
    <AdminShell title="Statistics">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Row 0 — Filters */}
        <Card sx={{ mb: 2 }}>
          <CardBody>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="subtitle2">Time Range</Typography>
                <Select
                  size="small"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="24h">Last 24h</MenuItem>
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                </Select>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <FilterListIcon fontSize="small" />
                <Typography variant="subtitle2">Tank</Typography>
                <Select
                  size="small"
                  value={tank}
                  onChange={(e) => setTank(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  {ALL_TANKS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={() => exportUsageCSV(filteredUsage)}
                sx={{ borderRadius: 2 }}
              >
                Export CSV
              </Button>
            </Stack>
          </CardBody>
        </Card>

        {/* Row 1 — KPI tiles */}
        <Grid container spacing={GUTTER} sx={{ mb: 0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPITile icon={<OpacityIcon />} label="Daily Usage" value={68} progress={68} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPITile
              icon={<AvTimerIcon />}
              label="Sensor Uptime"
              value={96}
              progress={96}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPITile
              icon={<LocalShippingIcon />}
              label="On-time Dispatch"
              value={82}
              progress={82}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPITile icon={<TrendingUpIcon />} label="Avg TDS" value={420} suffix=" ppm" />
          </Grid>
        </Grid>

        {/* Row 2 — Usage (Area) + Quality Mix (Pie) */}
        <Grid container spacing={GUTTER} sx={{ mb: 0.5 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Usage Over Time" />
              <CardBody sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredUsage} margin={{ left: -10, right: 10 }}>
                    <defs>
                      <linearGradient id="gUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <RTooltip />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#gUsage)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Water Quality Status" />
              <CardBody sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityMix}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                      label={({ name, value }) => `${name} (${value}%)`}
                    >
                      {qualityMix.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Grid>
        </Grid>

        {/* Row 3 — Uptime (Bar) + Alerts table */}
        <Grid container spacing={GUTTER}>
          <Grid item xs={12} md={7}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Sensor Uptime by Tank" />
              <CardBody sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uptimeByTank} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tank" tickLine={false} axisLine={false} />
                    <YAxis domain={[90, 100]} tickFormatter={(v) => `${v}%`} />
                    <RTooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="uptime" radius={[6, 6, 0, 0]} fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Recent Alerts" />
              <CardBody sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
                      <TableCell>Time</TableCell>
                      <TableCell>Tank</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="center">Severity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((a, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{a.ts}</TableCell>
                        <TableCell>{a.tank}</TableCell>
                        <TableCell>{a.type}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={a.sev}
                            color={
                              a.sev === "Critical"
                                ? "error"
                                : a.sev === "Warning"
                                ? "warning"
                                : "info"
                            }
                            variant={a.sev === "Info" ? "outlined" : "filled"}
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