import React, { useState } from "react";
import {
  Button, TextField, Paper, Typography, Box, Container,
  CssBaseline, Avatar, MenuItem, IconButton, InputAdornment, CircularProgress
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3a4a6b' },
    secondary: { main: '#ff6b6b' },
  },
});

const branchOptions = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics' },
  { value: 'ME', label: 'Mechanical' },
  { value: 'CE', label: 'Civil' },
  { value: 'EE', label: 'Electrical' },
];

const AddFaculty = () => {
  const [inputs, setInputs] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "", branch: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!inputs.name.trim()) newErrors.name = "Name is required";

    if (!inputs.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email))
      newErrors.email = "Enter a valid email";

    if (!inputs.password) newErrors.password = "Password is required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(inputs.password))
      newErrors.password = "Password must be 8+ chars with uppercase, lowercase, number";

    if (!inputs.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (inputs.password !== inputs.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!inputs.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(inputs.phone))
      newErrors.phone = "Phone number must be 10 digits";

    if (!inputs.branch) newErrors.branch = "Select branch";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveFaculty = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        name: inputs.name.trim(),
        email: inputs.email.trim().toLowerCase(),
        password: inputs.password,
        phone: inputs.phone.trim(),
        branch: inputs.branch,
        userType: "faculty", // explicitly set faculty
      };

      const res = await axios.post("http://localhost:3006/api/user/signup", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 60_000,
      });

      alert(res.data.message || "Faculty created successfully");
      navigate("/admindashboard"); // adjust route as needed
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      if (serverMsg) {
        setErrors(prev => ({ ...prev, server: serverMsg }));
      } else {
        setErrors(prev => ({ ...prev, server: "Save failed. Try again." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <HowToRegIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Add Faculty</Typography>
          <Paper elevation={3} sx={{ mt: 3, p: 4, width: '100%' }}>
            <Box component="form" onSubmit={saveFaculty} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal" required fullWidth label="Full Name"
                name="name" value={inputs.name} onChange={inputHandler}
                error={!!errors.name} helperText={errors.name || " "}
                autoComplete="name"
              />

              <TextField
                margin="normal" required fullWidth label="Email Address"
                name="email" value={inputs.email} onChange={inputHandler}
                error={!!errors.email} helperText={errors.email || " "}
                autoComplete="email"
              />

              <TextField
                margin="normal" required fullWidth label="Password" type={showPwd ? "text" : "password"}
                name="password" value={inputs.password} onChange={inputHandler}
                error={!!errors.password} helperText={errors.password || " "}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(prev => !prev)} edge="end" aria-label="toggle password">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                autoComplete="new-password"
              />

              <TextField
                margin="normal" required fullWidth label="Confirm Password" type={showPwd ? "text" : "password"}
                name="confirmPassword" value={inputs.confirmPassword} onChange={inputHandler}
                error={!!errors.confirmPassword} helperText={errors.confirmPassword || " "}
                autoComplete="new-password"
              />

              <TextField
                margin="normal" required fullWidth label="Phone Number" type="tel"
                name="phone" value={inputs.phone} onChange={inputHandler}
                error={!!errors.phone} helperText={errors.phone || " "}
                inputProps={{ maxLength: 10 }}
              />

              <TextField
                select margin="normal" required fullWidth label="Branch"
                name="branch" value={inputs.branch} onChange={inputHandler}
                error={!!errors.branch} helperText={errors.branch || " "}
              >
                {branchOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </TextField>

              {errors.server && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{errors.server}</Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : null}
              >
                {loading ? "Saving..." : "Save Faculty"}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button onClick={() => navigate('/admin/dashboard')} color="primary" sx={{ textTransform: 'none' }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AddFaculty;
