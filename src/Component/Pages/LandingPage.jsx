import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: "#f0f9ff", minHeight: "100dvh" }}>
      {/* 🔹 Navigation Bar */}
      <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Neptune
          </Typography>
          <Stack direction="row" spacing={3}>
            <Button color="inherit" href="#about">About</Button>
            <Button color="inherit" href="#why">Why Us</Button>
            <Button color="inherit" href="#tanks">Tanks</Button>
            <Button color="inherit" href="#team">Team</Button>
            <Button component={RouterLink} to="/login" variant="contained" sx={{ bgcolor: "white", color: "primary.main", fontWeight: 700 }}>Login</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* 🔹 Hero Section */}
      <Box id="hero" sx={{ py: 10, textAlign: "center", background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, color: "white", mb: 2 }}>
            Monitor. Manage. Conserve.
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.95)", mb: 4 }}>
            Efficiently monitor, manage, and conserve water resources with real-time analytics, leak detection, and smart control.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/login" size="large" variant="contained" sx={{ fontWeight: 700 }}>Login</Button>
            {/* <Button component={RouterLink} to="/add-tank" size="large" variant="outlined" sx={{ borderColor: "white", color: "white", fontWeight: 700 }}>Sign Up</Button> */}
          </Stack>
        </Container>
      </Box>

      {/* 🔹 About Us */}
      <Container id="about" sx={{ py: 8 }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontFamily: "serif" }}>About Us</Typography>
          <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto" }}>
            Neptune is a smart water management platform dedicated to transforming how people interact with water resources. 
            Our mission is to ensure sustainability by combining cutting-edge technology with user-friendly tools that help monitor 
            usage, detect leaks, and provide actionable insights. With Neptune, communities and households can enjoy reliable, 
            transparent, and efficient water management while contributing to a greener tomorrow.
          </Typography>
        </Paper>
      </Container>

      {/* 🔹 Why Neptune Section */}
      <Container id="why" sx={{ py: 4 }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>Why Choose Neptune?</Typography>
          <Grid container spacing={3}>
            {[
              "Real-time tank level monitoring",
              "Leak detection & instant alerts",
              "AI-based water quality analysis",
              "Flexible tank size options",
              "Mobile-friendly dashboards",
              "Community conservation insights",
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }} elevation={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{feature}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* 🔹 Tanks Section */}
      <Container id="tanks" sx={{ py: 8 }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 3 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>Our Tank Packages</Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "AquaLite", size: "350L", price: "LKR 12 000", img: "aqualite2.png" },
              { name: "HydroMax", size: "500L", price: "LKR 17 000", img: "hydromax.png" },
              { name: "BlueWave", size: "750L", price: "LKR 23 000", img: "bluewave2.png" },
              { name: "OceanPro", size: "1000L", price: "LKR 30 000", img: "oceanpro.png" },
            ].map((tank, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>

                <Card sx={{ borderRadius: 3 }}>
                <CardMedia component="img" height="250" image={tank.img} alt={tank.name} />

                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{tank.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{tank.size}</Typography>
                    <Typography variant="body2" color="text.secondary">{tank.price}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* 🔹 Team Section */}
      <Container id="team" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>Meet Our Team</Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { name: "Johan Costa", role: "Lead Developer/ Fullstack Engineer", img: "j2.jpg" },
            { name: "Dilan Atapattu", role: "Lead Developer/ Frontend Engineer", img: "dilan.jpg" },
            { name: "Wethmin Sirimanne", role: "Frontend Engineer/ UIUX Engineer", img: "wethmin.jpg" },
            { name: "Gayantha Wannisekara", role: "Project Manager", img: "gaya.jpg" },
            { name: "Kaushini Prabhasha", role: "Project Manager", img: "kaushi.jpg" },
          ].map((member, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }} elevation={4}>
                <Avatar src={member.img} alt={member.name} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{member.name}</Typography>
                <Typography variant="body2" color="text.secondary">{member.role}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🔹 Footer */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 2, textAlign: "center" }}>
        <Typography variant="body2">© {new Date().getFullYear()} Neptune • All rights reserved</Typography>
      </Box>
    </Box>
  );
}
