import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Print as PrintIcon,
  FileDownload as DownloadIcon,
  BarChart as ChartIcon,
} from "@mui/icons-material";
import { Item, ItemType } from "../../types/item";

// Mock report data
const generateReportData = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  return {
    // Summary for current month
    currentMonth: {
      month: today.toLocaleString("default", { month: "long" }),
      year: today.getFullYear(),
      totalLost: 14,
      totalFound: 12,
      totalClaimed: 8,
      totalDonated: 2,
      claimRate: 57.14, // Percentage of lost items that were found and claimed
      topCategories: [
        { type: "electronics", count: 7 },
        { type: "accessory", count: 5 },
        { type: "book", count: 4 },
      ],
      topLocations: [
        { location: "Library", count: 6 },
        { location: "Canteen", count: 5 },
        { location: "Gymnasium", count: 3 },
      ],
    },
    // Summary for previous month
    previousMonth: {
      month: lastMonth.toLocaleString("default", { month: "long" }),
      year: lastMonth.getFullYear(),
      totalLost: 18,
      totalFound: 15,
      totalClaimed: 10,
      totalDonated: 3,
      claimRate: 55.56,
      topCategories: [
        { type: "clothing", count: 8 },
        { type: "electronics", count: 6 },
        { type: "document", count: 4 },
      ],
      topLocations: [
        { location: "Canteen", count: 7 },
        { location: "JEB Building", count: 6 },
        { location: "Library", count: 5 },
      ],
    },
    // Unclaimed items about to be donated
    toBeDonatated: [
      {
        id: "unclaimed-1",
        name: "Umbrella",
        type: "accessory",
        dateReported: new Date(today.getFullYear(), today.getMonth() - 3, 10),
        status: "found",
        foundDate: new Date(today.getFullYear(), today.getMonth() - 3, 5),
        foundLocation: "SB Building",
      },
      {
        id: "unclaimed-2",
        name: "Calculator",
        type: "electronics",
        dateReported: new Date(today.getFullYear(), today.getMonth() - 3, 15),
        status: "found",
        foundDate: new Date(today.getFullYear(), today.getMonth() - 3, 12),
        foundLocation: "Library",
      },
      {
        id: "unclaimed-3",
        name: "Jacket",
        type: "clothing",
        dateReported: new Date(today.getFullYear(), today.getMonth() - 3, 18),
        status: "found",
        foundDate: new Date(today.getFullYear(), today.getMonth() - 3, 15),
        foundLocation: "Canteen",
      },
    ] as Item[],
  };
};

const reportData = generateReportData();

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reportMonth, setReportMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [reportYear, setReportYear] = useState<number>(
    new Date().getFullYear()
  );

  const handleReportTypeChange = (event: SelectChangeEvent<string>) => {
    setReportType(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setReportMonth(event.target.value);
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setReportYear(event.target.value as number);
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
  };

  const handleGenerateReport = () => {
    // Implement report generation functionality
    alert(
      "Report generation functionality will be implemented in a future update"
    );
  };

  const handlePrintReport = () => {
    // Implement print functionality
    alert("Print functionality will be implemented in a future update");
  };

  const handleDownloadReport = () => {
    // Implement download functionality
    alert("Download functionality will be implemented in a future update");
  };

  // Available months and years for the dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>

        {/* Report Generator */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generate Report
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="monthly">Monthly Report</MenuItem>
                  <MenuItem value="yearly">Yearly Report</MenuItem>
                  <MenuItem value="custom">Custom Date Range</MenuItem>
                  <MenuItem value="unclaimed">Unclaimed Items Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {reportType === "monthly" && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={reportMonth}
                      label="Month"
                      onChange={handleMonthChange}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={reportYear}
                      label="Year"
                      onChange={handleYearChange}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {reportType === "yearly" && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={reportYear}
                    label="Year"
                    onChange={handleYearChange}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {reportType === "custom" && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                </Grid>
              </>
            )}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                startIcon={<ChartIcon />}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Report Summaries */}
        <Typography variant="h6" gutterBottom>
          Recent Reports
        </Typography>
        <Grid container spacing={3}>
          {/* Current Month Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={`${reportData.currentMonth.month} ${reportData.currentMonth.year} Summary`}
                subheader="Current Month"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Lost Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.currentMonth.totalLost}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Found Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.currentMonth.totalFound}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Claimed Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.currentMonth.totalClaimed}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Claim Success Rate:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.currentMonth.claimRate}%
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Top Categories:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {reportData.currentMonth.topCategories.map(
                    (category, index) => (
                      <Chip
                        key={index}
                        label={`${category.type} (${category.count})`}
                        color={
                          category.type === "electronics"
                            ? "primary"
                            : category.type === "book"
                            ? "secondary"
                            : category.type === "document"
                            ? "info"
                            : category.type === "clothing"
                            ? "success"
                            : category.type === "accessory"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    )
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Top Locations:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {reportData.currentMonth.topLocations.map(
                    (location, index) => (
                      <Chip
                        key={index}
                        label={`${location.location} (${location.count})`}
                        variant="outlined"
                        size="small"
                      />
                    )
                  )}
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReport}
                >
                  Print
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Previous Month Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={`${reportData.previousMonth.month} ${reportData.previousMonth.year} Summary`}
                subheader="Previous Month"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Lost Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.previousMonth.totalLost}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Found Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.previousMonth.totalFound}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Claimed Items:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.previousMonth.totalClaimed}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Claim Success Rate:
                    </Typography>
                    <Typography variant="h6">
                      {reportData.previousMonth.claimRate}%
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Top Categories:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {reportData.previousMonth.topCategories.map(
                    (category, index) => (
                      <Chip
                        key={index}
                        label={`${category.type} (${category.count})`}
                        color={
                          category.type === "electronics"
                            ? "primary"
                            : category.type === "book"
                            ? "secondary"
                            : category.type === "document"
                            ? "info"
                            : category.type === "clothing"
                            ? "success"
                            : category.type === "accessory"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    )
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Top Locations:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {reportData.previousMonth.topLocations.map(
                    (location, index) => (
                      <Chip
                        key={index}
                        label={`${location.location} (${location.count})`}
                        variant="outlined"
                        size="small"
                      />
                    )
                  )}
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReport}
                >
                  Print
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Unclaimed Items Report */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Unclaimed Items Due for Donation (3+ months)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Found Date</TableCell>
                  <TableCell>Found Location</TableCell>
                  <TableCell>Age (Days)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.toBeDonatated.map((item) => {
                  const today = new Date();
                  const foundDate = new Date(item.foundDate || today);
                  const ageInDays = Math.floor(
                    (today.getTime() - foundDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)
                          }
                          size="small"
                          color={
                            item.type === "electronics"
                              ? "primary"
                              : item.type === "book"
                              ? "secondary"
                              : item.type === "document"
                              ? "info"
                              : item.type === "clothing"
                              ? "success"
                              : item.type === "accessory"
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{formatDate(foundDate)}</TableCell>
                      <TableCell>{item.foundLocation}</TableCell>
                      <TableCell>{ageInDays}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
            >
              Print Donation List
            </Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsPage;
