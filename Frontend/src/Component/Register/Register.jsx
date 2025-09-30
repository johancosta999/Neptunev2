import * as React from "react";
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  
} from "@mui/material";

export default function Register() {
  const [values, setValues] = React.useState({
    tankId: "",
    name: "",
    nic: "",
    contactNumber: "",
    email: "",
    location: "",
    password: "",
  });

  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, type: "success", msg: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  // Basic validations (tweak as needed)
  const validate = () => {
    const e = {};

    if (!values.tankId.trim()) e.tankId = "Tank ID is required";
    if (!values.name.trim()) e.name = "Name is required";

    // Sri Lanka NIC formats: 9 digits + [VvXx] or 12 digits (adjust if your format differs)
    if (!values.nic.trim()) e.nic = "NIC is required";
    else if (!/^\d{9}[VvXx]$|^\d{12}$/.test(values.nic))
      e.nic = "Use 9 digits + V/X or 12 digits";

    if (!values.contactNumber.trim()) e.contactNumber = "Contact number is required";
    else if (!/^\+?\d{9,15}$/.test(values.contactNumber))
      e.contactNumber = "Enter a valid phone number";

    if (!values.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Enter a valid email";

    if (!values.location.trim()) e.location = "Location is required";

    if (!values.password.trim()) e.password = "Password is required";
    else if (values.password.length < 6) e.password = "Min 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      // 🔗 Adjust the URL to match your backend route
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Registration failed");
      }

      setToast({ open: true, type: "success", msg: "Registered successfully!" });
      // optional: redirect to login after a short delay
      // setTimeout(() => navigate("/login"), 800);
      setValues({
        tankId: "",
        name: "",
        nic: "",
        contactNumber: "",
        email: "",
        location: "",
        password: "",
      });
    } catch (err) {
      setToast({ open: true, type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #eef7ff 0%, #e7fbf7 100%)",
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 800 }}>
          User Register
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backdropFilter: "saturate(140%) blur(6px)",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tankId"
                  label="Tank ID"
                  value={values.tankId}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.tankId}
                  helperText={errors.tankId}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Name"
                  value={values.name}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="nic"
                  label="NIC"
                  value={values.nic}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.nic}
                  helperText={errors.nic}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="contactNumber"
                  label="Contact Number"
                  value={values.contactNumber}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Location"
                  value={values.location}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "flex-end", justifyContent: { xs: "stretch", sm: "flex-end" } }}>
                <Link to={"/homepage"}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 160, borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={22} /> : "Register"}
                </Button>
            </Link>

              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}