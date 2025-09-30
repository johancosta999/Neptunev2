import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton, InputAdornment, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AdminShell from "./AdminShell";

import {
  listProducts, createProduct, updateProduct, adjustStock, deleteProduct
} from "../../api/products";

const GUTTER = 3;

const Card = ({ children, sx }) => (
  <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: "1px solid", borderColor: "divider", ...sx }}>
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

const CardBody = ({ children, sx }) => <Box sx={{ px: 2.5, py: 2.25, ...sx }}>{children}</Box>;

export default function AdminStock() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(null); // product object
  const [delta, setDelta] = useState(0);

  // add/edit form state
  const [form, setForm] = useState({
    name: "", sku: "", category: "", price: 0, stock: 0, minStock: 0, image: null
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await listProducts({ q, category });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line */ }, [q, category]);

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category));
    return ["All", ...Array.from(set).filter(Boolean)];
  }, [items]);

  const low = (row) => Number(row.stock) <= Number(row.minStock);

  /* ------------------------------ handlers ------------------------------ */

  const handleCreate = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, v);
    });
    await createProduct(fd);
    setAddOpen(false);
    setForm({ name: "", sku: "", category: "", price: 0, stock: 0, minStock: 0, image: null });
    fetchItems();
  };

  const handleUpdate = async () => {
    const payload = { ...form };
    delete payload.image; // not editing image here
    await updateProduct(editOpen._id, payload);
    setEditOpen(null);
    fetchItems();
  };

  const handleAdjust = async () => {
    if (!delta) return;
    await adjustStock(adjustOpen._id, Number(delta));
    setAdjustOpen(null);
    setDelta(0);
    fetchItems();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    await deleteProduct(row._id);
    fetchItems();
  };

  /* --------------------------------- UI -------------------------------- */

  return (
    <AdminShell title="Stock">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={GUTTER}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Inventory"
                action={
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search by name, SKU, category"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: 320 }}
                    />
                    <TextField
                      size="small"
                      select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </TextField>
                    <Button variant="contained" onClick={() => setAddOpen(true)}>
                      Add Product
                    </Button>
                  </Stack>
                }
              />
              <CardBody sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
                      <TableCell width={56}></TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell width={140}>SKU</TableCell>
                      <TableCell width={160}>Category</TableCell>
                      <TableCell width={120} align="right">Price</TableCell>
                      <TableCell width={120} align="right">In Stock</TableCell>
                      <TableCell width={120} align="right">Min</TableCell>
                      <TableCell width={120} align="center">Status</TableCell>
                      <TableCell width={160} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading && items.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell>
                          {row.imageUrl ? (
                            <Avatar variant="rounded" src={`http://localhost:5000${row.imageUrl}`} />
                          ) : (
                            <Avatar variant="rounded">{row.name[0]}</Avatar>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.3}>
                            <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Added {new Date(row.createdAt).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{row.sku}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">${Number(row.price || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">{row.stock}</TableCell>
                        <TableCell align="right">{row.minStock}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={low(row) ? "Low" : "OK"}
                            color={low(row) ? "warning" : "success"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton color="success" onClick={() => { setAdjustOpen(row); setDelta(1); }}>
                            <AddIcon />
                          </IconButton>
                          <IconButton color="warning" onClick={() => { setAdjustOpen(row); setDelta(-1); }}>
                            <RemoveIcon />
                          </IconButton>
                          <IconButton color="primary" onClick={() => { setEditOpen(row); setForm(row); }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(row)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* --------------------------- Add Product --------------------------- */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth label="Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="SKU" value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Category" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth type="number" label="Price" value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth type="number" label="Initial Stock" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth type="number" label="Min Stock" value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ mr: 1 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                (optional)
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ----------------------------- Edit -------------------------------- */}
      <Dialog open={Boolean(editOpen)} onClose={() => setEditOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth label="Name" value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="SKU" value={form.sku || ""} disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Category" value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth type="number" label="Price" value={form.price || 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth type="number" label="Min Stock" value={form.minStock || 0}
                onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* --------------------------- Adjust Stock -------------------------- */}
      <Dialog open={Boolean(adjustOpen)} onClose={() => setAdjustOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock — {adjustOpen?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Positive number to add, negative to remove.
            </Typography>
            <TextField
              type="number"
              label="Quantity change"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdjust}>Apply</Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  );
}