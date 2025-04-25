import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PageHeader from '../../components/common/PageHeader';
import { RootState, AppDispatch } from '../../store';
import { fetchAllItems } from '../../store/slices/itemsSlice';
import ReportRenderer from '../../components/reports/ReportRenderer';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { generateReport, ReportOptions, DateRange } from '../../services/reportService';

// Get current date info
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Get current year and past 5 years
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [report, setReport] = useState<Blob | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { 
    items, 
    loading: itemsLoading, 
    error 
  } = useSelector((state: RootState) => state.items);
  
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  // Check if a month/year combination is in the future
  const isFutureDate = (month: number, year: number): boolean => {
    if (year > currentYear) return true;
    if (year === currentYear && month > currentMonth) return true;
    return false;
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    const newMonth = event.target.value as number;
    // Only set the month if it's not in the future
    if (!isFutureDate(newMonth, selectedYear)) {
      setSelectedMonth(newMonth);
    }
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const newYear = event.target.value as number;
    setSelectedYear(newYear);
    
    // If the new year is the current year and selected month is in the future, reset to current month
    if (newYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  };

  const generateReportPdf = async (reportType: string) => {
    setLoading(true);
    setReport(null);
    
    try {
      let title = '';
      let reportOptions: ReportOptions;
      
      switch (reportType) {
        case 'monthly': {
          // Filter items for selected month and year
          const startDate = new Date(selectedYear, selectedMonth, 1);
          const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
          
          title = `Monthly Report - ${months[selectedMonth]} ${selectedYear}`;
          
          // Get previous month for comparison
          const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
          const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
          const prevStartDate = new Date(prevYear, prevMonth, 1);
          const prevEndDate = new Date(prevYear, prevMonth + 1, 0);
          
          reportOptions = {
            reportType: 'summary',
            title,
            dateRange: { startDate, endDate },
            filters: {
              // We want all found items (including those that were later claimed)
              // We don't include "lost" items in the report as requested
            }
          };
          break;
        }
          
        case 'yearly': {
          // Create date range for the selected year
          const startDate = new Date(selectedYear, 0, 1);
          const endDate = new Date(selectedYear, 11, 31);
          
          title = `Yearly Report - ${selectedYear}`;
          
          reportOptions = {
            reportType: 'summary',
            title,
            dateRange: { startDate, endDate },
            filters: {
              // We want all found items (including those that were later claimed)
              // We don't include "lost" items in the report as requested
            }
          };
          break;
        }
          
        case 'unclaimed':
          // Filter unclaimed items (found but not claimed)
          title = 'Unclaimed Items Report';
          
          reportOptions = {
            reportType: 'itemsList',
            title,
            filters: {
              statuses: ['found']
            }
          };
          break;
          
        case 'donated':
          // Filter donated items
          title = 'Donated Items Report';
          
          reportOptions = {
            reportType: 'itemsList',
            title,
            filters: {
              statuses: ['donated']
            }
          };
          break;
          
        default:
          throw new Error(`Invalid report type: ${reportType}`);
      }
      
      console.log("Generating report with options:", reportOptions);
      
      // Generate PDF using the reportService
      const blob = await generateReport(items, reportOptions);
      setReport(blob);
      setReportTitle(title);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render the pickers for month and year selection
  const renderDatePickers = (reportType: string) => {
    if (reportType === 'monthly') {
      return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={selectedMonth}
                label="Month"
                onChange={handleMonthChange}
              >
                {months.map((month, index) => (
                  <MenuItem 
                    key={month} 
                    value={index}
                    disabled={isFutureDate(index, selectedYear)}
                  >
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="Year"
                onChange={handleYearChange}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );
    } else if (reportType === 'yearly') {
      return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="Year"
                onChange={handleYearChange}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );
    }
    return null;
  };

  const renderReportCard = (type: string, title: string, description: string, icon: React.ReactNode) => {
    return (
      <Grid item xs={12}>
        <Card 
          raised={selectedReport === type} 
          sx={{ 
            cursor: 'pointer',
            transition: 'all 0.3s',
            transform: selectedReport === type ? 'scale(1.02)' : 'scale(1)',
            '&:hover': { transform: 'scale(1.02)' }
          }}
          onClick={() => setSelectedReport(type)}
        >
          <CardContent>
            <Box display="flex" alignItems="flex-start">
              <Box mr={2}>{icon}</Box>
              <Box flex={1}>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
                {/* Render date pickers directly below the description */}
                {selectedReport === type && renderDatePickers(type)}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
        title="Reports" 
        description="Generate and download reports about the lost and found items"
      />
      
      <Paper sx={{ width: '100%', mt: 3, p: 3 }}>
        <Grid container spacing={3}>
          {/* Report selection and controls */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Select Report Type
              </Typography>
              
              <Box mb={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => selectedReport && generateReportPdf(selectedReport)}
                  disabled={loading || !selectedReport}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                </Button>
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {renderReportCard(
                  'monthly',
                  'Monthly Report',
                  'View summary of found and claimed items for a specific month',
                  <CalendarTodayIcon color="primary" sx={{ fontSize: 30 }} />
                )}
                
                {renderReportCard(
                  'yearly',
                  'Yearly Report',
                  'View annual summary with monthly trends of found and claimed items',
                  <CalendarMonthIcon color="primary" sx={{ fontSize: 30 }} />
                )}
                
                {renderReportCard(
                  'unclaimed',
                  'Unclaimed Items',
                  'View all items that have not been claimed yet',
                  <InventoryIcon color="primary" sx={{ fontSize: 30 }} />
                )}
                
                {renderReportCard(
                  'donated',
                  'Donated Items',
                  'View all items that have been donated',
                  <CardGiftcardIcon color="primary" sx={{ fontSize: 30 }} />
                )}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Report preview */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, height: '800px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Report Preview
                </Typography>
                
                {report && !loading && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => {
                      if (report) {
                        const url = URL.createObjectURL(report);
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    Open Full Report
                  </Button>
                )}
              </Box>
              
              {!report && !loading && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '700px',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" color="text.secondary">
                    {selectedReport 
                      ? "Click 'Generate Report' to see the preview" 
                      : "Select a report type and click 'Generate Report' to see the preview"}
                  </Typography>
                </Box>
              )}
              
              {loading && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '700px',
                  flexDirection: 'column'
                }}>
                  <CircularProgress />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Generating report...
                  </Typography>
                </Box>
              )}
              
              {report && !loading && (
                <Box sx={{ height: 'calc(100% - 50px)' }}>
                  <ReportRenderer
                    report={report}
                    title={reportTitle}
                    loading={false}
                    error={null}
                    onRefresh={() => generateReportPdf(selectedReport as string)}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ReportsPage;
