import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { updateUserProfile } from "../../store/slices/authSlice";
import { User, UserRole } from "../../types/user";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>(
    user || {
      username: "",
      email: "",
      name: "",
      role: "admin",
      department: "",
    }
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleRoleChange = (e: SelectChangeEvent<UserRole>) => {
    setProfileData({ ...profileData, role: e.target.value as UserRole });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Reset to original data if canceling edit
    if (editMode) {
      setProfileData(user || {});
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would validate data and make an API call
    dispatch(updateUserProfile(profileData));
    setEditMode(false);
    setSuccessMessage("Profile updated successfully!");
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // For demo purposes, ensure we have data
  const displayData = user || {
    id: "user-1",
    username: "admin",
    email: "admin@dlsl.edu.ph",
    name: "Admin User",
    role: "admin" as UserRole,
    department: "SDFO",
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              src={displayData.profileImage}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {displayData.name.charAt(0)}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {displayData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {displayData.role.charAt(0).toUpperCase() +
                displayData.role.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {displayData.department || "Department not specified"}
            </Typography>

            <Divider sx={{ width: "100%", my: 2 }} />

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Account Created:</strong>{" "}
                {new Date(displayData.createdAt).toLocaleDateString()}
              </Typography>
              {displayData.lastLogin && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Last Login:</strong>{" "}
                  {new Date(displayData.lastLogin).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            <Button
              variant={editMode ? "outlined" : "contained"}
              color={editMode ? "error" : "primary"}
              sx={{ mt: 2 }}
              onClick={handleEditToggle}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
          </Paper>
        </Grid>

        {/* Profile Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editMode ? "Edit Profile Information" : "Profile Information"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profileData.username || displayData.username}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={profileData.name || displayData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email || displayData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={profileData.department || displayData.department || ""}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              {displayData.role === "superAdmin" && editMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={profileData.role || displayData.role}
                      label="Role"
                      name="role"
                      onChange={handleRoleChange}
                      disabled={!editMode}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superAdmin">Super Admin</MenuItem>
                      <MenuItem value="viewer">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Paper>

          {/* Security Settings */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 1 }}
              disabled={!editMode}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
