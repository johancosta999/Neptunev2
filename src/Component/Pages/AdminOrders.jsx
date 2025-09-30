// src/Component/Pages/AdminOrders.jsx
import React from "react";
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, Box } from "@mui/material";
import AdminShell from "./AdminShell";

export default function AdminOrders() {
  const rows = [
    { id: "#2638", name: "Brooklyn Zoe", price: "$44.00", status: "Pending" },
    { id: "#2639", name: "John McCormick", price: "$35.00", status: "Dispatch" },
    { id: "#2640", name: "Sandra Pugh", price: "$42.00", status: "Completed" },
  ];
  const color = s => s === "Completed" ? "success" : s === "Dispatch" ? "primary" : "warning";
  return (
    <AdminShell title="Dashboard">
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(11,27,72,0.08)" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Orders</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
              <TableCell>#</TableCell><TableCell>Customer</TableCell>
              <TableCell align="right">Price</TableCell><TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">{r.price}</TableCell>
                <TableCell align="center"><Chip size="small" label={r.status} color={color(r.status)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </AdminShell>
  );
}