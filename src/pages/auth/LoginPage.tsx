import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { login, clearError } from "../../store/slices/authSlice";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBack from "@mui/icons-material/ArrowBack";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'superAdmin' | 'admin' | 'viewer'>('viewer');
  const [adminType, setAdminType] = useState<'superAdmin' | 'admin'>('admin');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Get role from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    
    if (roleParam === 'admin') {
      setRole('admin');
    } else if (roleParam === 'dlsl') {
      setRole('viewer');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    // Use adminType if role is admin
    const finalRole = role === 'admin' ? adminType : role;

    dispatch(login({ username, password, role: finalRole }))
      .unwrap()
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        // Error is handled in the reducer
      });
  };

  const handleBack = () => {
    navigate("/");
  };

  const isLocked = error && error.includes('Account locked');

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 8,
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{ position: "absolute", top: 20, left: 20 }}
      >
          <ArrowBack />
        </IconButton>

        <Paper
          elevation={3}
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 1,
            }}
          >
            DLSL Lost and Found
          </Typography>
          <Typography
            component="h2"
            variant="h5"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            {role === 'viewer' ? 'DLSL Community Login' : 'Admin Login'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}

          {!isLocked && (
          <Box
            component="form"
            onSubmit={handleSubmit}
              sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
                sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
                type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {role === 'admin' && (
                <TextField
                  select
                  fullWidth
                  label="Admin Type"
                  value={adminType}
                  onChange={(e) => setAdminType(e.target.value as 'superAdmin' | 'admin')}
                  SelectProps={{ native: true }}
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </TextField>
              )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  borderRadius: 2,
                }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
          )}
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          Student Discipline and Formation Office (SDFO)
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
