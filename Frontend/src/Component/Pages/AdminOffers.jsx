import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, MenuItem, Paper, Select, Stack, Switch, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AdminShell from "./AdminShell";

import { listProducts } from "../../api/products";
import { listOffers, createOffer, updateOffer, deleteOffer, toggleOffer } from "../../api/offers";

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

// derive status color
const statusChip = (s) =>
  s === "Active" ? { color: "success", label: s }
  : s === "Scheduled" ? { color: "info", label: s }
  : s === "Expired" ? { color: "default", label: s }
  : { color: "warning", label: "Inactive" };

export default function AdminOffers() {
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const [form, setForm] = useState({
    title: "", code: "", description: "",
    discountType: "percent", amount: 10,
    startDate: "", endDate: "",
    active: true,
    productIds: [],
    usageLimit: 0,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([
        listProducts(),
        listOffers({ q, status: status === "All" ? undefined : status })
      ]);
      setProducts(p);
      setOffers(o);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [q, status]);

  const productMap = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p._id, p));
    return m;
  }, [products]);

  const resetForm = () =>
    setForm({
      title: "", code: "", description: "",
      discountType: "percent", amount: 10,
      startDate: "", endDate: "",
      active: true,
      productIds: [],
      usageLimit: 0,
    });

  const onCreate = async () => {
    await createOffer(form);
    setOpen(false);
    resetForm();
    fetchAll();
  };

  const onUpdate = async () => {
    await updateOffer(edit._id, form);
    setEdit(null);
    fetchAll();
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete offer ${row.code}?`)) return;
    await deleteOffer(row._id);
    fetchAll();
  };

  const onToggle = async (row) => {
    await toggleOffer(row._id);
    fetchAll();
  };

  return (
    <AdminShell title="Offers">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={GUTTER}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Manage Offers"
                action={
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search code or title"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      sx={{ width: 280 }}
                    />
                    <TextField
                      select size="small" label="Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      {["All", "Active", "Scheduled", "Expired", "Inactive"].map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </TextField>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpen(true); }}>
                      New Offer
                    </Button>
                  </Stack>
                }
              />
              <CardBody sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f7f9ff", fontWeight: 800 } }}>
                      <TableCell>Code</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell width={130}>Discount</TableCell>
                      <TableCell width={210}>Period</TableCell>
                      <TableCell width={160}>Applies To</TableCell>
                      <TableCell width={120} align="center">Status</TableCell>
                      <TableCell width={140} align="center">Active</TableCell>
                      <TableCell width={120} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loading && offers.map((o) => {
                      const discount =
                        o.discountType === "percent" ? `${o.amount}%` : `$${o.amount}`;
                      const period = `${new Date(o.startDate).toLocaleDateString()} → ${new Date(o.endDate).toLocaleDateString()}`;
                      const applies =
                        o.productIds?.length
                          ? `${o.productIds.length} product${o.productIds.length > 1 ? "s" : ""}`
                          : "All (none selected)";
                      const chip = statusChip(o.status);

                      return (
                        <TableRow key={o._id} hover>
                          <TableCell sx={{ fontWeight: 800 }}>{o.code}</TableCell>
                          <TableCell>
                            <Stack spacing={0}>
                              <Typography sx={{ fontWeight: 700 }}>{o.title}</Typography>
                              {o.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {o.description}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{discount}</TableCell>
                          <TableCell>{period}</TableCell>
                          <TableCell>{applies}</TableCell>
                          <TableCell align="center">
                            <Chip size="small" color={chip.color} label={chip.label} />
                          </TableCell>
                          <TableCell align="center">
                            <Switch checked={o.active} onChange={() => onToggle(o)} />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" onClick={() => { setEdit(o); setForm({
                              title: o.title, code: o.code, description: o.description || "",
                              discountType: o.discountType, amount: o.amount,
                              startDate: String(o.startDate).slice(0,10),
                              endDate:   String(o.endDate).slice(0,10),
                              active: o.active, productIds: o.productIds?.map(p => p._id || p) || [],
                              usageLimit: o.usageLimit || 0,
                            }); }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => onDelete(o)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!loading && offers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                          No offers yet.
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

      {/* Create */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Offer</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Discount Type" value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <MenuItem value="percent">Percent (%)</MenuItem>
                <MenuItem value="fixed">Fixed ($)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="number" fullWidth label="Amount" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth type="date" label="Start" InputLabelProps={{ shrink: true }}
                value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth type="date" label="End" InputLabelProps={{ shrink: true }}
                value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select fullWidth label="Applies to products"
                SelectProps={{ multiple: true, renderValue: (ids) => {
                  if (!ids.length) return "All (none selected)";
                  const names = ids.map((id) => (products.find(p => p._id === id)?.name || "Unknown"));
                  return names.join(", ");
                }}}
                value={form.productIds}
                onChange={(e) => setForm({ ...form, productIds: e.target.value })}
              >
                {products.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} — {p.sku}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField type="number" fullWidth label="Usage Limit (0=unlimited)" value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
                <PowerSettingsNewIcon fontSize="small" />
                <Typography>Active</Typography>
                <Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={Boolean(edit)} onClose={() => setEdit(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Offer</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Discount Type" value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <MenuItem value="percent">Percent (%)</MenuItem>
                <MenuItem value="fixed">Fixed ($)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="number" fullWidth label="Amount" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField type="date" fullWidth label="Start" InputLabelProps={{ shrink: true }}
                value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField type="date" fullWidth label="End" InputLabelProps={{ shrink: true }}
                value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select fullWidth label="Applies to products"
                SelectProps={{ multiple: true, renderValue: (ids) => {
                  if (!ids.length) return "All (none selected)";
                  const names = ids.map((id) => (products.find(p => p._id === id)?.name || "Unknown"));
                  return names.join(", ");
                }}}
                value={form.productIds}
                onChange={(e) => setForm({ ...form, productIds: e.target.value })}
              >
                {products.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} — {p.sku}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField type="number" fullWidth label="Usage Limit (0=unlimited)" value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
                <PowerSettingsNewIcon fontSize="small" />
                <Typography>Active</Typography>
                <Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdit(null)}>Cancel</Button>
          <Button variant="contained" onClick={onUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  );
}