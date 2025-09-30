// src/Component/Pages/AdminShell.jsx
import React from "react";
import {
  AppBar, Box, Container, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, TextField, Toolbar, Typography, InputAdornment
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

// Sidebar icons
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined"; // Dashboard
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";     // Order
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";           // Statistic
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";       // Product
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";         // Stock
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";       // Offer

export default function AdminShell({ title, children }) {
  const location = useLocation();
  const is = (p) => location.pathname.startsWith(p);

  const navItemSx = {
    my: 0.5,
    borderRadius: 1.5,
    color: "inherit",
    "&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.18)" },
    "&:hover": { backgroundColor: "rgba(255,255,255,0.22)" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
        background: "linear-gradient(135deg, #ecfaff 0%, #e7f3ff 50%, #eef6ff 100%)",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "linear-gradient(180deg, #0a56ff 0%, #1c6bff 45%, #1e74ff 100%)",
          color: "white",
          p: 2,
        }}
      >
        <Box
          sx={{
            height: 56, borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, letterSpacing: 0.3,
          }}
        >
          SmartWater
        </Box>

        <List sx={{ mt: 2 }}>
          <ListItemButton
            component={RouterLink}
            to="/admin/dashboard"
            selected={is("/admin/dashboard")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <SpaceDashboardOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/orders"
            selected={is("/admin/orders")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <ReceiptLongOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Order" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/statistics"
            selected={is("/admin/statistics")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <InsightsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Statistic" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/products"
            selected={is("/admin/products")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <Inventory2OutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Product" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/stock"
            selected={is("/admin/stock")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <InventoryOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Stock" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/offers"
            selected={is("/admin/offers")}
            sx={navItemSx}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <LocalOfferOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Offer" />
          </ListItemButton>
        </List>

        <Box sx={{ flexGrow: 1 }} />
      </Box>

      {/* Main */}
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <AppBar
          elevation={0}
          position="sticky"
          sx={{
            top: 0,
            bgcolor: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
            color: "inherit",
            borderBottom: "1px solid rgba(11,27,72,0.06)",
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {title}
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              sx={{ mr: 2, bgcolor: "#fff", borderRadius: 1.5, minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton><NotificationsNoneOutlinedIcon /></IconButton>
            <IconButton><SettingsOutlinedIcon /></IconButton>
            <IconButton><PersonOutlineOutlinedIcon /></IconButton>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 4 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}