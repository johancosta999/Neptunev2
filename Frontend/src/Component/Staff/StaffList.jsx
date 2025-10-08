import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminNav from "../Nav/adminNav";

export default function Staff() {
  /* ----------------------- state ----------------------- */
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState({});
  const [refreshingTasks, setRefreshingTasks] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    location: "",
  });

  // local filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  /* ---------------------- theme ------------------------ */
  // Admin orange accent
  const ACCENT = {
    main: "#f97316",
    soft: "#fb923c",
  };

  // Dark palette (single color rows!)
  const BG = {
    page: "#0b1020",
    card: "#0e1628",
    head: "#0d1322", // table head
    row:  "#0d1322", // <-- single color for all rows
    border: "rgba(148,163,184,.16)",
    hover: "#15213a",
  };

  const TEXT = {
    primary: "#e5e7eb",
    dim: "#cbd5e1",
  };

  const roleColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r.includes("admin"))
      return { bg: "rgba(251,146,60,.15)", color: "#FDBA74", border: "rgba(251,146,60,.35)" };
    if (r.includes("seller"))
      return { bg: "rgba(96,165,250,.15)", color: "#93C5FD", border: "rgba(96,165,250,.35)" };
    if (r.includes("tech"))
      return { bg: "rgba(110,231,183,.15)", color: "#6EE7B7", border: "rgba(110,231,183,.35)" };
    return { bg: "rgba(148,163,184,.15)", color: "#cbd5e1", border: "rgba(148,163,184,.35)" };
  };

  /* -------------------- helpers ------------------------ */
  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.results && Array.isArray(payload.results)) return payload.results;
    if (payload && typeof payload === "object") {
      const values = Object.values(payload);
      if (values.length && values.every((v) => v && typeof v === "object")) return values;
    }
    return [];
  };

  /* --------------------- data io ----------------------- */
  const fetchStaff = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/staff")
      .then((res) => res.json())
      .then((data) => setStaffList(normalizeToArray(data)))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  };

  const fetchAssignedTasks = async (showLoading = false) => {
    try {
      if (showLoading) setRefreshingTasks(true);
      const response = await fetch("http://localhost:5000/api/issues");
      const issues = await response.json();
      
      // Count assigned tasks for each staff member
      const taskCounts = {};
      issues.forEach(issue => {
        if (issue.assignedTo) {
          taskCounts[issue.assignedTo] = (taskCounts[issue.assignedTo] || 0) + 1;
        }
      });
      
      setAssignedTasks(taskCounts);
    } catch (err) {
      console.error("Error fetching assigned tasks:", err);
    } finally {
      if (showLoading) setRefreshingTasks(false);
    }
  };

  const refreshAssignedTasks = () => {
    fetchAssignedTasks(true);
  };

  useEffect(() => {
    fetchStaff();
    fetchAssignedTasks();
  }, []);

  // Auto-refresh assigned tasks every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignedTasks();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOpen = (staff = null) => {
    setEditingStaff(staff);
    setFormData(
      staff
        ? {
            name: staff.name || "",
            email: staff.email || "",
            phone: staff.phone || "",
            position: staff.Position || staff.position || "",
            location: staff.location || "",
          }
        : { name: "", email: "", phone: "", position: "", location: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setEditingStaff(null);
    setOpen(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const method = editingStaff ? "PUT" : "POST";
    const url = editingStaff
      ? `http://localhost:5000/api/staff/${editingStaff._id}`
      : "http://localhost:5000/api/staff";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        fetchStaff();
        handleClose();
      })
      .catch((err) => console.error("Save error:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    fetch(`http://localhost:5000/api/staff/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => fetchStaff())
      .catch((err) => console.error("Delete error:", err));
  };

  /* -------------------- filtering ---------------------- */
  const safeList = Array.isArray(staffList) ? staffList : [];
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return safeList.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const role = (s.Position || s.position || s.role || "").toLowerCase();
      const passSearch = !q || name.includes(q);
      const passRole = !roleFilter || role.includes(roleFilter.toLowerCase());
      return passSearch && passRole;
    });
  }, [safeList, search, roleFilter]);

  /* ----------------------- ui -------------------------- */
  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        p: 2,
        backgroundColor: BG.page,
        color: TEXT.primary,
        boxSizing: "border-box",
      }}
    >
      <AdminNav />

      {/* header + actions */}
      <Box
        sx={{
          mt: 2,
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: BG.card,
          border: `1px solid ${BG.border}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              fontWeight: 900,
              letterSpacing: ".2px",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: ACCENT.main,
                boxShadow: `0 0 0 6px rgba(249,115,22,.15)`,
              }}
            />
            Staff
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: TEXT.dim }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 280,
                "& .MuiInputBase-root": {
                  bgcolor: "#0a1220",
                  color: TEXT.primary,
                  borderRadius: 2,
                  border: `1px solid ${BG.border}`,
                },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />

            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{
                minWidth: 160,
                bgcolor: "#0a1220",
                color: TEXT.primary,
                borderRadius: 2,
                border: `1px solid ${BG.border}`,
                ".MuiSvgIcon-root": { color: TEXT.dim },
              }}
            >
              <MenuItem value="">All roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
            </Select>

            <Button
              variant="contained"
              onClick={refreshAssignedTasks}
              disabled={refreshingTasks}
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                background: `linear-gradient(135deg, #10b981, #34d399)`,
                boxShadow: "0 8px 20px rgba(16,185,129,.28)",
                textTransform: "none",
                borderRadius: 2,
                minWidth: 120,
                opacity: refreshingTasks ? 0.7 : 1,
              }}
            >
              {refreshingTasks ? "Refreshing..." : "Refresh Tasks"}
            </Button>

            <Link to="/staffs/add">
            <Button
              variant="contained"
              // onClick={() => handleOpen()}
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                background: `linear-gradient(135deg, ${ACCENT.main}, ${ACCENT.soft})`,
                boxShadow: "0 12px 24px rgba(249,115,22,.28)",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Add Staff
            </Button>
            </Link>
          </Box>
        </Box>
      </Box>

      {/* table */}
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          borderRadius: 2,
          bgcolor: BG.card,
          border: `1px solid ${BG.border}`,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: TEXT.primary }} />
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: BG.head,
                    color: TEXT.primary,
                    fontWeight: 800,
                    borderBottom: `1px solid ${BG.border}`,
                  },
                }}
              >
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Assigned Tasks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((staff) => {
                const role = staff.Position || staff.position || staff.role || "";
                const color = roleColor(role);

                return (
                  <TableRow
                    key={staff._id || staff.id || staff.email}
                    sx={{
                      // *** SINGLE COLOR — NO ZEBRA ***
                      backgroundColor: BG.row,
                      backgroundImage: "none",
                      filter: "none",
                      "& td": {
                        borderBottom: `1px solid ${BG.border}`,
                        color: TEXT.primary,
                      },
                      "&:nth-of-type(odd)": { backgroundColor: BG.row },
                      "&:nth-of-type(even)": { backgroundColor: BG.row },
                      "&:hover": {
                        backgroundColor: BG.hover,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>{staff.name || "—"}</TableCell>
                    <TableCell sx={{ color: TEXT.dim }}>{staff.email || "—"}</TableCell>
                    <TableCell sx={{ color: TEXT.dim }}>{staff.phone || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={role || "—"}
                        sx={{
                          bgcolor: color.bg,
                          color: color.color,
                          border: `1px solid ${color.border}`,
                          fontWeight: 900,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: TEXT.dim }}>{staff.location || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={assignedTasks[staff._id || staff.id] || 0}
                        sx={{
                          bgcolor: assignedTasks[staff._id || staff.id] > 0 ? "rgba(34,197,94,.15)" : "rgba(148,163,184,.15)",
                          color: assignedTasks[staff._id || staff.id] > 0 ? "#22c55e" : "#cbd5e1",
                          border: assignedTasks[staff._id || staff.id] > 0 ? "rgba(34,197,94,.35)" : "rgba(148,163,184,.35)",
                          fontWeight: 900,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => handleOpen(staff)}
                        variant="contained"
                        size="small"
                        sx={{
                          mr: 1,
                          textTransform: "none",
                          borderRadius: 2,
                          bgcolor: "#334155",
                          color: "#e2e8f0",
                          "&:hover": { bgcolor: "#475569" },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(staff._id)}
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          bgcolor: "#7f1d1d",
                          color: "#fee2e2",
                          "&:hover": { bgcolor: "#b91c1c" },
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                    No staff found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "#0f172a",
            border: `1px solid ${BG.border}`,
            color: TEXT.primary,
            borderRadius: 2,
            minWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingStaff ? "Update Staff" : "Add Staff"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: TEXT.dim } }}
            InputProps={{
              sx: {
                color: TEXT.primary,
                bgcolor: "#0a1220",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: TEXT.dim } }}
            InputProps={{
              sx: {
                color: TEXT.primary,
                bgcolor: "#0a1220",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: TEXT.dim } }}
            InputProps={{
              sx: {
                color: TEXT.primary,
                bgcolor: "#0a1220",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Position / Role"
            name="position"
            value={formData.position}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: TEXT.dim } }}
            InputProps={{
              sx: {
                color: TEXT.primary,
                bgcolor: "#0a1220",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: TEXT.dim } }}
            InputProps={{
              sx: {
                color: TEXT.primary,
                bgcolor: "#0a1220",
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 900,
              color: "#0f172a",
              background: `linear-gradient(135deg, ${ACCENT.main}, ${ACCENT.soft})`,
              boxShadow: "0 12px 24px rgba(249,115,22,.28)",
            }}
          >
            {editingStaff ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
