import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  FindInPage as FindIcon,
  Check as CheckIcon,
  CardGiftcard as DonateIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { fetchDashboardStats } from "../../store/slices/itemsSlice";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.items);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Early return if loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If stats are not loaded yet, return placeholder
  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="info">Loading dashboard data...</Alert>
      </Box>
    );
  }

  // Stats cards data
  const statsCards = [
    {
      title: "Lost Items",
      value: stats.lostItems,
      icon: <FindIcon fontSize="large" color="error" />,
      color: "#ffa1a1",
    },
    {
      title: "Found Items",
      value: stats.foundItems,
      icon: <InventoryIcon fontSize="large" color="info" />,
      color: "#a1d2ff",
    },
    {
      title: "Claimed Items",
      value: stats.claimedItems,
      icon: <CheckIcon fontSize="large" color="success" />,
      color: "#a1ffa1",
    },
    {
      title: "Donated Items",
      value: stats.donatedItems,
      icon: <DonateIcon fontSize="large" color="warning" />,
      color: "#ffeaa1",
    },
  ];

  // Chart data for pie chart
  const pieChartData = {
    labels: ["Lost", "Found", "Claimed", "Donated"],
    datasets: [
      {
        data: [
          stats.lostItems,
          stats.foundItems,
          stats.claimedItems,
          stats.donatedItems,
        ],
        backgroundColor: ["#ff6384", "#36a2eb", "#4bc0c0", "#ffcd56"],
        hoverBackgroundColor: ["#ff4c76", "#2e90d1", "#3eabab", "#ffc43b"],
      },
    ],
  };

  // Chart data for categories
  const categoryChartData = {
    labels: Object.keys(stats.itemCategories),
    datasets: [
      {
        label: "Items by Category",
        data: Object.values(stats.itemCategories),
        backgroundColor: [
          "#4bc0c0",
          "#36a2eb",
          "#ff6384",
          "#ffcd56",
          "#9966ff",
          "#c9cbcf",
        ],
      },
    ],
  };

  // Chart data for monthly trends
  const monthlyChartData = {
    labels: stats.monthlyData.labels,
    datasets: [
      {
        label: "Lost Items",
        data: stats.monthlyData.lost,
        backgroundColor: "#ff6384",
      },
      {
        label: "Found Items",
        data: stats.monthlyData.found,
        backgroundColor: "#36a2eb",
      },
    ],
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{ p: 2, bgcolor: card.color, height: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                  <Typography variant="h3" component="div">
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Item Status Distribution
            </Typography>
            <Box sx={{ height: 230 }}>
              <Pie
                data={pieChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Success Rate
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                height: 230,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: `conic-gradient(#4caf50 ${stats.successRate}%, #e0e0e0 0)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h4">{stats.successRate}%</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Percentage of items that were claimed or donated
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Items by Category
            </Typography>
            <Box sx={{ height: 230 }}>
              <Pie
                data={categoryChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Trends
            </Typography>
            <Box sx={{ height: 230 }}>
              <Bar data={monthlyChartData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
