import React, { useEffect, useMemo, useState, useRef } from "react";
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AdminNav from "../Nav/adminNav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Staff() {
  /* ----------------------- state ----------------------- */
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState({});
  const [refreshingTasks, setRefreshingTasks] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Ref for PDF generation
  const tableRef = useRef(null);

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

  /* -------------------- PDF generation ------------------- */
  const generatePDF = async () => {
    if (!tableRef.current) {
      console.error("Table ref not found");
      return;
    }

    setGeneratingPDF(true);
    
    try {
      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.width = '1200px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.padding = '0';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.lineHeight = '1.4';
      
      // Create professional header with company branding
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #f97316, #fb923c);
          color: white;
          padding: 30px 40px;
          margin-bottom: 0;
          border-radius: 0;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 1px;">NEPTUNE</h1>
              <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: 300; opacity: 0.9;">Water Quality Management System</h2>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; opacity: 0.9;">Staff Directory</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
        
        <div style="
          background: #f8fafc;
          padding: 25px 40px;
          border-bottom: 3px solid #f97316;
          margin-bottom: 30px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Staff List Report</h3>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Complete directory of all staff members and their assignments</p>
            </div>
            <div style="text-align: right;">
              <div style="background: #f97316; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 16px;">
                ${filtered.length} Staff Members
              </div>
            </div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(header);

      // Clone the table and modify it for PDF
      const tableClone = tableRef.current.cloneNode(true);
      
      // Remove action buttons from PDF table
      const actionCells = tableClone.querySelectorAll('td:last-child, th:last-child');
      actionCells.forEach(cell => {
        if (cell.textContent.includes('Edit') || cell.textContent.includes('Delete') || cell.textContent.includes('Actions')) {
          cell.remove();
        }
      });

      // Create table wrapper with professional styling
      const tableWrapper = document.createElement('div');
      tableWrapper.style.cssText = `
        margin: 0 40px 40px 40px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
      `;

      // Style the table for PDF
      tableClone.style.width = '100%';
      tableClone.style.borderCollapse = 'collapse';
      tableClone.style.fontSize = '13px';
      tableClone.style.color = '#1e293b';
      tableClone.style.margin = '0';
      
      // Style table headers with professional gradient
      const headers = tableClone.querySelectorAll('th');
      headers.forEach((header, index) => {
        header.style.cssText = `
          background: linear-gradient(135deg, #1e293b, #334155);
          color: #ffffff;
          padding: 16px 12px;
          border: none;
          font-weight: 700;
          text-align: left;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #f97316;
        `;
      });

      // Style table cells with professional alternating rows
      const rows = tableClone.querySelectorAll('tr');
      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row
        
        const cells = row.querySelectorAll('td');
        const isEven = rowIndex % 2 === 0;
        
        cells.forEach((cell, cellIndex) => {
          cell.style.cssText = `
            padding: 14px 12px;
            border: none;
            border-bottom: 1px solid #e2e8f0;
            background-color: ${isEven ? '#ffffff' : '#f8fafc'};
            color: #1e293b;
            font-size: 13px;
            vertical-align: middle;
          `;
          
          // Special styling for specific columns
          if (cellIndex === 0) { // Staff ID column
            cell.style.fontFamily = 'monospace';
            cell.style.fontSize = '12px';
            cell.style.color = '#64748b';
            cell.style.fontWeight = '600';
          } else if (cellIndex === 1) { // Name column
            cell.style.fontWeight = '700';
            cell.style.color = '#1e293b';
          } else if (cellIndex === 4) { // Role column
            cell.style.textAlign = 'center';
          } else if (cellIndex === 6) { // Assigned Tasks column
            cell.style.textAlign = 'center';
          }
          
          // Style chips/badges with professional appearance
          const chips = cell.querySelectorAll('[style*="background"]');
          chips.forEach(chip => {
            const chipText = chip.textContent.toLowerCase();
            let chipStyle = '';
            
            if (chipText.includes('admin')) {
              chipStyle = 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;';
            } else if (chipText.includes('seller')) {
              chipStyle = 'background: #dbeafe; color: #1e40af; border: 1px solid #3b82f6;';
            } else if (chipText.includes('tech')) {
              chipStyle = 'background: #d1fae5; color: #065f46; border: 1px solid #10b981;';
            } else {
              chipStyle = 'background: #f1f5f9; color: #475569; border: 1px solid #94a3b8;';
            }
            
            chip.style.cssText = `
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              ${chipStyle}
            `;
          });
        });
      });

      tableWrapper.appendChild(tableClone);
      pdfContainer.appendChild(tableWrapper);

      // Add professional footer
      const footer = document.createElement('div');
      footer.innerHTML = `
        <div style="
          background: #1e293b;
          color: white;
          padding: 20px 40px;
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
        ">
          <div style="margin-bottom: 8px; font-weight: 600;">Neptune Water Quality Management System</div>
          <div style="opacity: 0.8;">Generated on ${new Date().toLocaleString()} | Confidential Document</div>
        </div>
      `;
      pdfContainer.appendChild(footer);

      document.body.appendChild(pdfContainer);

      // Generate PDF with higher quality
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: pdfContainer.scrollHeight,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Clean up
      document.body.removeChild(pdfContainer);

      // Download PDF with professional filename
      const fileName = `Neptune_Staff_Directory_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
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

            <Button
              variant="contained"
              onClick={generatePDF}
              disabled={generatingPDF || loading || filtered.length === 0}
              startIcon={<PictureAsPdfIcon />}
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                background: `linear-gradient(135deg, #dc2626, #ef4444)`,
                boxShadow: "0 8px 20px rgba(220,38,38,.28)",
                textTransform: "none",
                borderRadius: 2,
                minWidth: 140,
                opacity: (generatingPDF || loading || filtered.length === 0) ? 0.7 : 1,
              }}
            >
              {generatingPDF ? "Generating..." : "Download PDF"}
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
        ref={tableRef}
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
                <TableCell>Staff ID</TableCell>
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
                    <TableCell sx={{ color: TEXT.dim, fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {staff.id || staff._id || "—"}
                    </TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#94a3b8" }}>
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
