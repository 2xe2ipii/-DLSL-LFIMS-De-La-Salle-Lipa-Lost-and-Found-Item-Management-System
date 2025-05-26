import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LostItemsPage from "./pages/items/LostItemsPage";
import FoundItemsPage from "./pages/items/FoundItemsPage";
import ClaimedItemsPage from "./pages/items/ClaimedItemsPage";
import ForDonationPage from "./pages/items/ForDonationPage";
import ReportsPage from "./pages/reports/ReportsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { useAppSelector } from "./hooks/useRedux";
import { UserRole } from './types/user';
import AccessDeniedPage from './pages/AccessDeniedPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleBasedRoute from './components/RoleBasedRoute';
import DeletedItemsPage from './pages/items/DeletedItemsPage';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#006400", // DLSL Green
    },
    secondary: {
      main: "#a30000", // DLSL Red
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App with routes
const AppRoutes = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Route - Accessible by all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Items Routes - Accessible by all authenticated users */}
        <Route
          path="/items/lost"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LostItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/found"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FoundItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/claimed"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClaimedItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/donation"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ForDonationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin-only Routes */}
        <Route
          path="/reports"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'superAdmin'] as UserRole[]}>
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'superAdmin'] as UserRole[]}>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* SuperAdmin-only Routes */}
        <Route
          path="/admin/users"
          element={
          <RoleBasedRoute allowedRoles={['superAdmin'] as UserRole[]}>
            <MainLayout>
              <UserManagementPage />
            </MainLayout>
          </RoleBasedRoute>
          }
        />

        {/* Access Denied Page */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Admin-only Routes */}
        <Route
          path="/deleted-items"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'superAdmin'] as UserRole[]}>
              <MainLayout>
                <DeletedItemsPage />
              </MainLayout>
            </RoleBasedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
