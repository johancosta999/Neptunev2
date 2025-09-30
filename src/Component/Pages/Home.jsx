import React from "react";
import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#121212",
        color: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 4,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
        Welcome to Smart Water Management System
      </Typography>
    </Box>
  );
}
