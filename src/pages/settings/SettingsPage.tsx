import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  TextField,
  Button,
  FormControlLabel,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  SelectChangeEvent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Restore as BackupIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "DLSL Lost and Found Item Management System",
    donationDays: 90,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,

    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "00:00",

    // User Management
    userApproval: true,
    passwordPolicy: "medium",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    handleSettingChange(name, checked);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    handleSettingChange(name, value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    handleSettingChange(name, value);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save settings to the server
    console.log("Saving settings:", settings);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
          <Tab
            label="Notifications"
            icon={<NotificationsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Data Management"
            icon={<StorageIcon />}
            iconPosition="start"
          />
          {isSuperAdmin && (
            <Tab
              label="User Management"
              icon={<PeopleIcon />}
              iconPosition="start"
            />
          )}
          {isSuperAdmin && (
            <Tab
              label="Security"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          )}
          {isSuperAdmin && (
            <Tab label="Admin" icon={<AdminIcon />} iconPosition="start" />
          )}
        </Tabs>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="System Name"
                name="systemName"
                value={settings.systemName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Donation Period (Days)"
                name="donationDays"
                type="number"
                value={settings.donationDays}
                onChange={handleInputChange}
                helperText="Number of days before unclaimed items are marked for donation"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Send email notifications for important events"
              />
              <Switch
                edge="end"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleSwitchChange}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="SMS Notifications"
                secondary="Send SMS notifications for important events"
              />
              <Switch
                edge="end"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleSwitchChange}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </List>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Data Management Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Data Management Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <BackupIcon />
              </ListItemIcon>
              <ListItemText
                primary="Automatic Backups"
                secondary="Enable automatic database backups"
              />
              <Switch
                edge="end"
                name="autoBackup"
                checked={settings.autoBackup}
                onChange={handleSwitchChange}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            {settings.autoBackup && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <BackupIcon />
                  </ListItemIcon>
                  <ListItemText primary="Backup Frequency" />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      name="backupFrequency"
                      value={settings.backupFrequency}
                      label="Frequency"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <BackupIcon />
                  </ListItemIcon>
                  <ListItemText primary="Backup Time" />
                  <TextField
                    type="time"
                    name="backupTime"
                    value={settings.backupTime}
                    onChange={handleInputChange}
                    sx={{ width: 200 }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </>
            )}
          </List>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Manual Backup
            </Button>
            <Button variant="outlined" color="primary">
              Restore from Backup
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>

        {/* User Management Settings */}
        {isSuperAdmin && (
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              User Management Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Require Admin Approval for New Users"
                  secondary="New user accounts require approval before activation"
                />
                <Switch
                  edge="end"
                  name="userApproval"
                  checked={settings.userApproval}
                  onChange={handleSwitchChange}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </List>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </TabPanel>
        )}

        {/* Security Settings */}
        {isSuperAdmin && (
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Password Policy</InputLabel>
                  <Select
                    name="passwordPolicy"
                    value={settings.passwordPolicy}
                    label="Password Policy"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="low">
                      Basic (Minimum 6 characters)
                    </MenuItem>
                    <MenuItem value="medium">
                      Medium (Minimum 8 characters, mixed case)
                    </MenuItem>
                    <MenuItem value="high">
                      Strong (Minimum 10 characters, mixed case, numbers,
                      symbols)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Force Password Reset for All Users
              </Button>
              <Button variant="outlined" color="error">
                Clear All Sessions
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </TabPanel>
        )}

        {/* Admin Settings */}
        {isSuperAdmin && (
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              Administrative Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                These actions are irreversible and should be used with caution.
              </Alert>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Export All Data
              </Button>
              <Button variant="outlined" color="warning" sx={{ mr: 2 }}>
                Reset System
              </Button>
              <Button variant="outlined" color="error">
                Purge Deleted Records
              </Button>
            </Box>
          </TabPanel>
        )}
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
