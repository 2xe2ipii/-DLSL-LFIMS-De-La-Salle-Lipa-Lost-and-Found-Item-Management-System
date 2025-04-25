import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  SelectChangeEvent,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Item } from '../../types/item';
import { generateReport, ReportOptions } from '../../services/reportService';
import ReportRenderer from './ReportRenderer';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface ReportGeneratorProps {
  items: Item[];
  title: string;
  loading: boolean;
  error: string | null;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  items,
  title,
  loading: itemsLoading,
  error
}) => {
  // State for report options
  const [reportType, setReportType] = useState<string>('summary');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  
  // State for report generation
  const [generating, setGenerating] = useState<boolean>(false);
  const [report, setReport] = useState<Blob | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportError, setReportError] = useState<string | null>(null);

  // Handler for report type change
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  // Handler for custom title change
  const handleCustomTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(event.target.value);
  };

  // Generate the report
  const handleGenerateReport = useCallback(async () => {
    setGenerating(true);
    setReport(null);
    setReportError(null);
    
    try {
      // Create title
      const finalTitle = customTitle || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      setReportTitle(finalTitle);
      
      // Create report options
      const reportOptions: ReportOptions = {
        reportType: reportType as any,
        title: finalTitle,
        dateRange: {
          startDate,
          endDate
        }
      };
      
      // Generate PDF
      const blob = await generateReport(items, reportOptions);
      setReport(blob);
    } catch (error) {
      console.error('Error generating report:', error);
      setReportError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [items, reportType, startDate, endDate, customTitle]);

  const handleRefreshReport = () => {
    setReportError(null);
    handleGenerateReport();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Report configuration panel */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Configure Advanced Report
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Report Type */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  id="report-type"
                  value={reportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="summary">Summary Report</MenuItem>
                  <MenuItem value="itemsDetail">Detailed Items Report</MenuItem>
                  <MenuItem value="itemsList">Items List Report</MenuItem>
                  <MenuItem value="donation">Donation Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Date Range */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Date Range (Optional)
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            
            {/* Custom Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Title (Optional)"
                value={customTitle}
                onChange={handleCustomTitleChange}
                placeholder="Enter a custom title for your report"
              />
            </Grid>
            
            {/* Generate Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleGenerateReport}
                disabled={generating || itemsLoading}
              >
                {generating ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Report preview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '800px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report Preview
              </Typography>
              
              {report && (
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
            
            <Box sx={{ height: 'calc(100% - 50px)' }}>
              <ReportRenderer
                report={report}
                title={reportTitle}
                loading={generating}
                error={reportError || (error && 'Error loading items. Please try again.')}
                onRefresh={handleRefreshReport}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportGenerator; 