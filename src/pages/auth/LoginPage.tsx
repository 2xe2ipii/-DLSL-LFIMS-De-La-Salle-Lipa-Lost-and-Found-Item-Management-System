import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../store/slices/authSlice";
import { User } from "../../types/user";

// This is a mock function for login until we have a real API
const mockLogin = (
  username: string,
  password: string
): Promise<{ user: User; token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, accept "admin" with password "password"
      if (username === "admin" && password === "password") {
        resolve({
          user: {
            id: "1",
            username: "admin",
            email: "admin@dlsl.edu.ph",
            name: "Admin User",
            role: "admin",
            createdAt: new Date(),
            department: "SDFO",
          },
          token: "mock-jwt-token",
        });
      } else if (username === "superadmin" && password === "password") {
        resolve({
          user: {
            id: "2",
            username: "superadmin",
            email: "superadmin@dlsl.edu.ph",
            name: "Super Admin",
            role: "superAdmin",
            createdAt: new Date(),
            department: "SDFO",
          },
          token: "mock-jwt-token-super",
        });
      } else {
        reject(new Error("Invalid username or password"));
      }
    }, 1000); // Simulate network delay
  });
};

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      dispatch(loginFailure("Please enter both username and password"));
      return;
    }

    try {
      dispatch(loginStart());
      // In a real app, this would be an API call
      const result = await mockLogin(username, password);
      dispatch(loginSuccess(result));
      navigate("/dashboard");
    } catch (error) {
      dispatch(loginFailure((error as Error).message));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            DLSL Lost and Found
          </Typography>
          <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
            Admin Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Grid item>
          <Typography variant="body2" color="text.secondary" align="center">
            Student Discipline and Formation Office (SDFO)
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
