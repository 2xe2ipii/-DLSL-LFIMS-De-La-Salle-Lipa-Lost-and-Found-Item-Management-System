import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  LockReset as ResetIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { resetAdminPasswords, loadUser } from '../../store/slices/authSlice';
import { User } from '../../types/user';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const UserManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Check if user is superAdmin
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(loadUser());
    } else if (user && user.role !== 'superAdmin') {
      console.log('User is not superAdmin, redirecting');
      navigate('/access-denied');
    }
  }, [user, isAuthenticated, dispatch, navigate]);

  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [viewerUsers, setViewerUsers] = useState<User[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    username: string;
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'viewer' | '';
  }>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: ''
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Fetch all admin users when component mounts
  useEffect(() => {
    if (user && user.role === 'superAdmin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const adminUsers = await authService.getAdminUsers();
      setAdminUsers(adminUsers.filter(user => user.role === 'admin'));
      setViewerUsers(adminUsers.filter(user => user.role === 'viewer'));
      
      if (notification.severity === 'error') {
        setNotification({
          open: false,
          message: '',
          severity: 'success'
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load users';
      
      setNotification({
        open: true,
        message: `Failed to load users: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateDialogOpen = (role: 'admin' | 'viewer') => {
    setNewUser(prev => ({ ...prev, role }));
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      name: '',
      role: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setNewUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation checks
      if (!newUser.username || !newUser.email || !newUser.password || !newUser.name || !newUser.role) {
        setNotification({
          open: true,
          message: 'All fields are required',
          severity: 'error'
        });
        return;
      }

      // Ensure role is either 'admin' or 'viewer'
      if (newUser.role !== 'admin' && newUser.role !== 'viewer') {
        setNotification({
          open: true,
          message: 'Invalid role selected',
          severity: 'error'
        });
        return;
      }

      // Password validation
      if (newUser.password.length < 6) {
        setNotification({
          open: true,
          message: 'Password must be at least 6 characters long',
          severity: 'error'
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setNotification({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error'
        });
        return;
      }

      // Use authService to create user with specified role
      await authService.createAdminUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role // Ensure the role is passed correctly
      });

      setNotification({
        open: true,
        message: 'User created successfully!',
        severity: 'success'
      });
      
      handleCreateDialogClose();
      await fetchUsers(); // Refresh user list immediately
      
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAdminPasswords = async () => {
    try {
      setIsResetting(true);
      // Use authService instead of dispatch
      const result = await authService.resetAdminPasswords();
      
      setNotification({
        open: true,
        message: 'All admin passwords have been reset. They will be prompted to change their password on next login.',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Failed to reset admin passwords:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset admin passwords';
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => handleCreateDialogOpen('admin')}
            sx={{ mr: 2 }}
          >
            Create Admin
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleCreateDialogOpen('viewer')}
          >
            Create Viewer
          </Button>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ mr: 2 }}
          >
            Refresh List
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ResetIcon />}
            onClick={handleResetAdminPasswords}
            disabled={isResetting}
          >
            {isResetting ? <CircularProgress size={24} /> : 'Reset All Admin Passwords'}
          </Button>
        </Box>
      </Box>

      {/* Admin Users Table */}
      <Typography variant="h6" gutterBottom>
        Admin Users
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Last Login</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminUsers.length > 0 ? (
                adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'superAdmin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No admin users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Viewer Users Table */}
      <Typography variant="h6" gutterBottom>
        Viewer Users
      </Typography>
      <TableContainer component={Paper}>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Last Login</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {viewerUsers.length > 0 ? (
                viewerUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No viewer users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New {newUser.role === 'admin' ? 'Admin' : 'Viewer'} User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              value={newUser.username}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={handleInputChange}
              helperText="Password must be at least 6 characters long"
              required
            />
            <TextField
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={newUser.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained" 
            color={newUser.role === 'admin' ? 'success' : 'primary'}
            disabled={isSubmitting || !newUser.username || !newUser.email || !newUser.password || !newUser.name}
          >
            {isSubmitting ? <CircularProgress size={24} /> : `Create ${newUser.role === 'admin' ? 'Admin' : 'Viewer'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage; 