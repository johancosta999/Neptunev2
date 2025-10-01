// src/Component/Pages/LandingPage.jsx
import React from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Paper, Stack,
  Grid, Card, CardContent, CardMedia, Avatar, Chip, Divider
} from "@mui/material";
import { keyframes } from "@mui/system";
import { Link as RouterLink } from "react-router-dom";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ScienceIcon from "@mui/icons-material/Science";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import InsightsIcon from "@mui/icons-material/Insights";

/** Water-friendly palette used in the previous version */
const c = {
  deep: "#0B2A3B",   // deep navy
  ocean: "#0E7490",  // teal
  aqua: "#38BDF8",   // sky
  mint: "#14B8A6",   // accent
  foam: "#D0F3FF",   // highlight
};

/* ---------- animations ---------- */
// fall like a droplet
const drip = keyframes`
  0%   { transform: translateY(-12vh) scale(.95); opacity: 0; }
  10%  { opacity: .85; }
  100% { transform: translateY(110vh) scale(1); opacity: .9; }
`;
// soft entrance for content
const fadeUp = keyframes`
  from { opacity: 0; transform: translate3d(0, 12px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const hoverLift = {
  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
  "&:hover": { transform: "translateY(-6px)", boxShadow: 10, borderColor: "rgba(255,255,255,.25)" },
};

/* ---------- dripping background layer (non-interactive, super light) ---------- */
function DripLayer() {
  // fixed set for consistent look; tweak or add more for denser effect
  const drops = [
    { left: "6%",  size: 10, dur: 13, delay: 0 },
    { left: "14%", size: 14, dur: 16, delay: 2 },
    { left: "22%", size: 12, dur: 12, delay: 4 },
    { left: "29%", size: 9,  dur: 11, delay: 1.5 },
    { left: "37%", size: 11, dur: 15, delay: 3.5 },
    { left: "44%", size: 16, dur: 18, delay: 0.8 },
    { left: "52%", size: 10, dur: 13, delay: 2.2 },
    { left: "59%", size: 13, dur: 17, delay: 4.6 },
    { left: "66%", size: 9,  dur: 12, delay: 1.2 },
    { left: "73%", size: 12, dur: 16, delay: 2.8 },
    { left: "80%", size: 10, dur: 14, delay: 3.1 },
    { left: "88%", size: 15, dur: 19, delay: 0.4 },
  ];

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* gentle vertical gradient sheen so drips blend with background */}
      <Box sx={{
        position: "absolute", inset: 0,
        background: `radial-gradient(1200px 400px at 50% -10%, rgba(255,255,255,.06), transparent),
                     linear-gradient(180deg, ${c.deep}00, ${c.aqua}00)`,
      }} />

      {drops.map((d, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: 0,
            left: d.left,
            width: d.size,
            height: d.size * 1.8,
            // pill/tear shape
            borderRadius: "50% 50% 60% 60% / 45% 45% 70% 70%",
            background: `linear-gradient(180deg, ${c.foam}, ${c.aqua}88)`,
            boxShadow: `0 8px 14px ${c.deep}55`,
            filter: "blur(.2px)",
            opacity: 0.75,
            animation: `${drip} ${d.dur}s linear ${d.delay}s infinite`,
            willChange: "transform",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
      ))}
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        position: "relative",
        background: `linear-gradient(180deg, ${c.deep} 0%, ${c.ocean} 40%, ${c.aqua} 100%)`,
      }}
    >
      {/* animated water drip layer */}
      <DripLayer />

      {/* NAVBAR (translucent over gradient) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(11,42,59,.85)",
          backdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          zIndex: (t) => t.zIndex.appBar, // stays above drips
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 68 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <WaterDropIcon sx={{ color: c.foam, mr: 0.25 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: .3 }}>
              Neptune
            </Typography>
            <Chip label="smart water" size="small" sx={{ ml: 1, height: 20, bgcolor: "rgba(56,189,248,.15)", color: "#fff" }} />
          </Stack>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }}>
            <Button color="inherit" href="#about">About</Button>
            <Button color="inherit" href="#why">Why Us</Button>
            <Button color="inherit" href="#tanks">Tanks</Button>
            <Button color="inherit" href="#team">Team</Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{ fontWeight: 800, bgcolor: "#fff", color: c.ocean, "&:hover": { bgcolor: "rgba(255,255,255,.9)" } }}
            >
              Login
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* HERO (image removed previously) */}
      <Box id="hero" sx={{ position: "relative", overflow: "hidden", py: { xs: 8, md: 12 }, color: "white", zIndex: 1 }}>
        <Box
          component="svg"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          sx={{ position: "absolute", inset: 0, opacity: 0.22, color: c.foam }}
        >
          <path d="M0,160 C300,220 520,60 820,100 C1100,138 1280,110 1440,70 L1440,0 L0,0 Z" fill="currentColor" />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-.6px", mb: 1, animation: `${fadeUp} .6s both` }}>
                Monitor. Manage. Conserve.
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,.95)", mb: 3, maxWidth: 740, animation: `${fadeUp} .8s both` }}>
                Efficiently monitor, manage, and conserve water resources with real-time analytics, leak detection, and smart control.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ animation: `${fadeUp} 1s both` }}>
                <Button component={RouterLink} to="/login" size="large" variant="contained"
                        sx={{ fontWeight: 800, bgcolor: c.foam, color: c.deep, "&:hover": { bgcolor: "#ffffff" } }}>
                  Get Started
                </Button>
                <Button href="#about" size="large" variant="outlined"
                        sx={{ borderColor: "rgba(255,255,255,.9)", color: "#fff", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" } }}>
                  Learn More
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        <Box component="svg" viewBox="0 0 1440 110" sx={{ display: "block", color: "rgba(255,255,255,.08)" }}>
          <path fill="currentColor" d="M0,96L1440,16L1440,110L0,110Z" />
        </Box>
      </Box>

      {/* ABOUT */}
      <Container id="about" sx={{ py: { xs: 5, md: 7 }, zIndex: 1, position: "relative" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 }, borderRadius: 4, mx: "auto", maxWidth: 1100,
            color: "#fff",
            background: "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.15)",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            animation: `${fadeUp} .5s both`,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>About Us</Typography>
          <Divider sx={{ width: 72, borderColor: "rgba(255,255,255,.35)", mb: 2 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: .95 }}>
            Neptune is a smart water management platform dedicated to transforming how people interact with water resources.
            Our mission is to ensure sustainability by combining cutting-edge technology with user-friendly tools that help monitor
            usage, detect leaks, and provide actionable insights. With Neptune, communities and households can enjoy reliable,
            transparent, and efficient water management while contributing to a greener tomorrow.
          </Typography>
        </Paper>
      </Container>

      {/* FEATURES */}
      <Container id="why" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 900, color: "#fff", mb: 3 }}>
          Product Features
        </Typography>
        <Grid container spacing={3}>
          {[
            { icon: <WaterDropIcon />, text: "Real-time tank level monitoring" },
            { icon: <NotificationsActiveIcon />, text: "Leak detection & instant alerts" },
            { icon: <ScienceIcon />, text: "AI-based water quality analysis" },
            { icon: <Inventory2Icon />, text: "Flexible tank size options" },
            { icon: <PhoneIphoneIcon />, text: "Mobile-friendly dashboards" },
            { icon: <InsightsIcon />, text: "Community conservation insights" },
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 4, textAlign: "left", color: "#fff",
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05))",
                  ...hoverLift,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 56, height: 56, borderRadius: "50%", mr: 1.5, display: "grid", placeItems: "center",
                      boxShadow: `0 8px 24px ${c.mint}55`,
                      background: `radial-gradient(circle at 30% 30%, ${c.mint}AA, ${c.mint}55 60%, transparent 70%)`,
                      color: "#06202B",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{f.text}</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: .85 }}>
                  Neptune surfaces insights and actions to help you reduce waste while ensuring continuous supply.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* TANKS */}
      <Container id="tanks" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 900, color: "#fff", mb: 3 }}>
          Our Tank Packages
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { name: "AquaLite", size: "350L", price: "LKR 12 000", img: "aqualite2.png" },
            { name: "HydroMax", size: "500L", price: "LKR 17 000", img: "hydromax.png" },
            { name: "BlueWave", size: "750L", price: "LKR 23 000", img: "bluewave2.png" },
            { name: "OceanPro", size: "1000L", price: "LKR 30 000", img: "oceanpro.png" },
          ].map((tank, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  borderRadius: 4, overflow: "hidden",
                  background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55))",
                  color: "#fff", border: "1px solid rgba(255,255,255,.12)", ...hoverLift,
                }}
              >
                <CardMedia component="img" height="240" image={tank.img} alt={tank.name} sx={{ objectFit: "cover" }} />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{tank.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: .8 }}>{tank.size}</Typography>
                  <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,.2)" }} />
                  <Chip label={tank.price} sx={{ bgcolor: "rgba(56,189,248,.15)", color: "#fff" }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* TEAM */}
      <Container id="team" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 900, color: "#fff", mb: 3 }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { name: "Johan Costa", role: "Lead Developer/ Fullstack Engineer", img: "j2.jpg" },
            { name: "Dilan Atapattu", role: "Lead Developer/ Frontend Engineer", img: "dilan.jpg" },
            { name: "Wethmin Sirimanne", role: "Frontend Engineer/ UIUX Engineer", img: "wethmin.jpg" },
            { name: "Gayantha Wannisekara", role: "Project Manager", img: "gaya.jpg" },
            { name: "Kaushini Prabhasha", role: "Project Manager", img: "kaushi.jpg" },
          ].map((m, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper
                elevation={0}
  sx={{
    p: 3,
    textAlign: "center",
    borderRadius: 4,
    color: "#fff",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05))",

    /* 🟦 new/stronger borders */
    border: "1px solid rgba(208,243,255,.35)",          // subtle outer stroke (foam/aqua)
    boxShadow: "0 12px 24px rgba(0,0,0,.25)",            // base depth
    outline: "1px solid rgba(6,32,43,.35)",              // hairline dark ring
    outlineOffset: "0px",

    /* hover: brighter aqua ring + lift */
    transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow:
        "0 18px 30px rgba(0,0,0,.35), 0 0 0 2px rgba(56,189,248,.55) inset",
      borderColor: "rgba(208,243,255,.7)",
    },
  }}
>
  <Avatar src={m.img} alt={m.name} sx={{ width: 96, height: 96, mx: "auto", mb: 2, boxShadow: 4 }} />
  <Typography variant="h6" sx={{ fontWeight: 800 }}>{m.name}</Typography>
  <Typography variant="body2" sx={{ opacity: .85 }}>{m.role}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FOOTER */}
      <Box sx={{ bgcolor: c.deep, color: "white", py: 3, textAlign: "center", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <Typography variant="body2">© {new Date().getFullYear()} Neptune • All rights reserved</Typography>
      </Box>
    </Box>
  );
}
