import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import AdminNav from "../Nav/adminNav";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });

  const fetchStaff = () => {
    fetch("http://localhost:5000/api/staff")
      .then((res) => res.json())
      .then((data) => {
        setStaffList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpen = (staff = null) => {
    setEditingStaff(staff);
    setFormData(
      staff
        ? {
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            position: staff.Position || "",
          }
        : { name: "", email: "", phone: "", position: "" }
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
    fetch(`http://localhost:5000/api/staff/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => fetchStaff())
      .catch((err) => console.error("Delete error:", err));
  };

  return (
    
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "#1a1a1a",
        color: "#fff",
        px: 4,
        pt: 4,
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <AdminNav />
      <Typography variant="h4" align="center" gutterBottom>
        Staff List
      </Typography>

      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add New Staff
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <TableContainer
            component={Paper}
            sx={{
              width: "95%",
              borderRadius: 2,
              bgcolor: "#fff",
              maxHeight: "65vh",
              overflowY: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Phone</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Position</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{staff.Position}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleOpen(staff)}
                        variant="outlined"
                        color="info"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(staff._id)}
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingStaff ? "Update Staff" : "Add Staff"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingStaff ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
