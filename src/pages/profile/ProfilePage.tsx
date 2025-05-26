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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { updateUserProfile, changePassword } from "../../store/slices/authSlice";
import { User, UserRole } from "../../types/user";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>(
    user || {
      username: "",
      email: "",
      name: "",
      role: "viewer",
      department: "",
    }
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSubmitPasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSuccessMessage("New passwords do not match!");
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    try {
      const result = await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      handleClosePasswordDialog();
      setSuccessMessage("Password changed successfully!");
      setAlertSeverity('success');
      setShowAlert(true);
    } catch (error: any) {
      console.error('Password change error:', error);
      setSuccessMessage(error.message || "Failed to change password. Please check your current password.");
      setAlertSeverity('error');
      setShowAlert(true);
    }
  };

  // For demo purposes, ensure we have data
  const displayData = user || {
    id: "user-1",
    username: "viewer",
    email: "viewer@dlsl.edu.ph",
    name: "Viewer User",
    role: "viewer" as UserRole,
    department: "Student",
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
              onClick={handleOpenPasswordDialog}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
              error={!!error}
              helperText={error}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitPasswordChange}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
