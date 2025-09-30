import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Typography, Avatar, Tooltip
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { api } from "../../api/client";
import AdminShell from "./AdminShell";

const CATEGORIES = ["Tanks", "Filters", "Sensors", "Pipes", "Accessories"];

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [form, setForm] = useState({
    name: "", serialNumber: "", category: "", price: "", stock: "", description: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const resetForm = () => {
    setForm({ name: "", serialNumber: "", category: "", price: "", stock: "", description: "" });
    setFile(null);
    setPreview("");
  };

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  async function onSubmit(e) {
    e.preventDefault();
    // basic validation
    if (!form.name || !form.serialNumber || !form.category) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("image", file);

    try {
      await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setOpen(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to add product");
    }
  }

  const rows = useMemo(() => items, [items]);

  return (
    <AdminShell title="Product">
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Product
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
              <TableCell>Image</TableCell>
              <TableCell>Serial #</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const status =
                r.stock <= 0 ? { label: "Out", color: "error" } :
                r.stock < 5  ? { label: "Low", color: "warning" } :
                               { label: "Active", color: "success" };
              return (
                <TableRow key={r._id} hover>
                  <TableCell>
                    <Avatar variant="rounded" src={r.imageUrl} alt={r.name} />
                  </TableCell>
                  <TableCell>{r.serialNumber}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell align="right">
                    {Number(r.price || 0).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                  </TableCell>
                  <TableCell align="right">{r.stock}</TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={status.label} color={status.color} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">No products yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Add Product dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Add Product
          <IconButton onClick={() => setOpen(false)}><CloseOutlinedIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Product name *"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Serial number *"
                  fullWidth
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    label="Category *"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Price"
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  fullWidth
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Stock"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Choose photo
                    <input hidden accept="image/*" type="file" onChange={onPickFile} />
                  </Button>
                  {file && <Typography variant="body2">{file.name}</Typography>}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  JPG/PNG up to ~5MB
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                {preview ? (
                  <Tooltip title="Preview">
                    <Avatar
                      variant="rounded"
                      src={preview}
                      sx={{ width: 120, height: 120, borderRadius: 2, boxShadow: 1 }}
                    />
                  </Tooltip>
                ) : (
                  <Box sx={{ width: 120, height: 120, borderRadius: 2, bgcolor: "#f3f6ff", border: "1px dashed #c7d2fe" }} />
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSubmit} variant="contained" sx={{ borderRadius: 2 }}>
            Save Product
          </Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  );
}