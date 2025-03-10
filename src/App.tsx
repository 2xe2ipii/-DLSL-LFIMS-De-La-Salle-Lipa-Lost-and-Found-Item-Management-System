import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import store from "./store";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LostItemsPage from "./pages/items/LostItemsPage";
import FoundItemsPage from "./pages/items/FoundItemsPage";
import ClaimedItemsPage from "./pages/items/ClaimedItemsPage";
import DonatedItemsPage from "./pages/items/DonatedItemsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import { useAppSelector } from "./hooks/useRedux";

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
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LostItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

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
          path="/items/donated"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DonatedItemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            </ProtectedRoute>
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

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
