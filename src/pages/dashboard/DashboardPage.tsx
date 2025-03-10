import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  FindInPage as FindIcon,
  Check as CheckIcon,
  CardGiftcard as DonateIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";
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

// Mock data until we have a real API
const generateMockData = () => {
  return {
    lostItems: 24,
    foundItems: 18,
    claimedItems: 15,
    donatedItems: 5,
    successRate: 62.5, // Percentage of lost items that were found and claimed
    itemCategories: {
      book: 12,
      electronics: 8,
      clothing: 14,
      accessory: 10,
      document: 6,
      other: 12,
    },
    monthlyData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      lost: [5, 8, 7, 9, 6, 8],
      found: [3, 5, 7, 4, 6, 7],
    },
    locations: {
      Canteen: 10,
      Gymnasium: 8,
      Library: 12,
      "JEB Building": 7,
      "SB Building": 9,
      Other: 16,
    },
  };
};

const mockData = generateMockData();

const DashboardPage: React.FC = () => {
  // In a real app, we would fetch data from an API or Redux store
  const { items } = useAppSelector((state) => state.items);

  // Mock status counts until we have real data
  const statusCounts = {
    lost:
      items.filter((item) => item.status === "lost").length ||
      mockData.lostItems,
    found:
      items.filter((item) => item.status === "found").length ||
      mockData.foundItems,
    claimed:
      items.filter((item) => item.status === "claimed").length ||
      mockData.claimedItems,
    donated:
      items.filter((item) => item.status === "donated").length ||
      mockData.donatedItems,
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Lost Items",
      value: statusCounts.lost,
      icon: <FindIcon fontSize="large" color="error" />,
      color: "#ffa1a1",
    },
    {
      title: "Found Items",
      value: statusCounts.found,
      icon: <InventoryIcon fontSize="large" color="info" />,
      color: "#a1d2ff",
    },
    {
      title: "Claimed Items",
      value: statusCounts.claimed,
      icon: <CheckIcon fontSize="large" color="success" />,
      color: "#a1ffa1",
    },
    {
      title: "Donated Items",
      value: statusCounts.donated,
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
          statusCounts.lost,
          statusCounts.found,
          statusCounts.claimed,
          statusCounts.donated,
        ],
        backgroundColor: ["#ff6384", "#36a2eb", "#4bc0c0", "#ffcd56"],
        hoverBackgroundColor: ["#ff4c76", "#2e90d1", "#3eabab", "#ffc43b"],
      },
    ],
  };

  // Chart data for categories
  const categoryChartData = {
    labels: Object.keys(mockData.itemCategories),
    datasets: [
      {
        label: "Items by Category",
        data: Object.values(mockData.itemCategories),
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
    labels: mockData.monthlyData.labels,
    datasets: [
      {
        label: "Lost Items",
        data: mockData.monthlyData.lost,
        backgroundColor: "#ff6384",
      },
      {
        label: "Found Items",
        data: mockData.monthlyData.found,
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
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader title="Status Distribution" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader title="Items by Category" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <Pie data={categoryChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader title="Claim Success Rate" />
            <Divider />
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  width: 200,
                  height: 200,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                >
                  <Typography variant="h4" component="div" color="primary">
                    {mockData.successRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Claim Success
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: `radial-gradient(closest-side, white 79%, transparent 80%),
                                conic-gradient(#4caf50 ${mockData.successRate}%, #e0e0e0 0)`,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Monthly Trends" />
            <Divider />
            <CardContent sx={{ height: 400 }}>
              <Bar data={monthlyChartData} options={barChartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
