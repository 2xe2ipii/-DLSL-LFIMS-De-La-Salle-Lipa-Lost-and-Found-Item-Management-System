import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  CardGiftcard as DonateIcon,
  PictureAsPdf as PdfIcon,
  ImageNotSupported as ImageNotSupportedIcon
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType, ItemStatus } from "../../types/item";
import { UserRole } from "../../types/user";
import { 
  fetchAllItems, 
  fetchItemsByStatus, 
  clearError, 
  changeItemStatusAPI 
} from "../../store/slices/itemsSlice";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { generateReport } from "../../services/reportService";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { formatToSentenceCase, formatDate } from "../../utils/formatters";
import MobileItemList from "../../components/items/MobileItemList";
import { useTheme, useMediaQuery } from "@mui/material";

// Helper to check if an item is eligible for donation (older than 3 months)
const isEligibleForDonation = (item: Item): boolean => {
  if (item.status !== 'found') return false;
  
  const datesToCheck = [item.foundDate, item.dateReported, item.createdAt];
  const earliestDate = datesToCheck
    .filter(date => date !== undefined)
    .map(date => new Date(date as Date | string))
    .sort((a, b) => a.getTime() - b.getTime())[0];
  
  if (!earliestDate) return false;
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return earliestDate < threeMonthsAgo;
};

interface DonationFormData {
  organization: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  donationDate: Date;
  notes: string;
}

const ForDonationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const [selectedItemForDonation, setSelectedItemForDonation] = useState<Item | null>(null);
  const [donationForm, setDonationForm] = useState<DonationFormData>({
    organization: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    donationDate: new Date(),
    notes: ''
  });
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedItemForCertificate, setSelectedItemForCertificate] = useState<Item | null>(null);
  const [certificateBlob, setCertificateBlob] = useState<Blob | null>(null);

  // Fetch items when component mounts
  useEffect(() => {
    dispatch(fetchAllItems());
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Filter items based on their status and eligibility
  const eligibleItems = useMemo(() => {
    return items.filter(item => isEligibleForDonation(item));
  }, [items]);

  const donatedItems = useMemo(() => {
    return items.filter(item => item.status === 'donated');
  }, [items]);

  // Filtered items for the current tab
  const currentItems = useMemo(() => {
    const itemsToFilter = tabValue === 0 ? eligibleItems : donatedItems;
    
    return itemsToFilter.filter(item => {
      const matchesSearch =
        (item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false);

      const matchesType = filterType ? item.type === filterType : true;

      return matchesSearch && matchesType;
    });
  }, [tabValue, eligibleItems, donatedItems, searchTerm, filterType]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    return currentItems.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [currentItems, page, rowsPerPage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleViewItem = (item: Item) => {
    setViewItem(item);
  };

  const handleCloseViewDialog = () => {
    setViewItem(null);
  };

  const handleOpenDonateDialog = (item: Item) => {
    setSelectedItemForDonation(item);
    setDonationForm({
      organization: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      donationDate: new Date(),
      notes: ''
    });
    setDonateDialogOpen(true);
  };

  const handleCloseDonateDialog = () => {
    setDonateDialogOpen(false);
    setSelectedItemForDonation(null);
    // Reset form data
    setDonationForm({
      organization: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      donationDate: new Date(),
      notes: ''
    });
    // Do not refresh items here
  };

  const handleDonationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDonationDateChange = (date: Date | null) => {
    if (date) {
      setDonationForm(prev => ({ ...prev, donationDate: date }));
    }
  };

  const handleSubmitDonation = () => {
    if (!selectedItemForDonation || !selectedItemForDonation.id) {
      console.error("Cannot donate item: Invalid item selected");
      return;
    }

    const donationData = {
      id: selectedItemForDonation.id,
      status: 'donated' as ItemStatus,
      additionalData: { 
        donatedTo: donationForm.organization,
        contactPerson: donationForm.contactPerson,
        contactEmail: donationForm.contactEmail,
        contactPhone: donationForm.contactPhone,
        donationDate: donationForm.donationDate.toISOString(),
        notes: donationForm.notes
      }
    };

    dispatch(changeItemStatusAPI(donationData))
      .unwrap()
      .then(() => {
        // Close the dialog
        setDonateDialogOpen(false);
        setSelectedItemForDonation(null);
        
        // Reset form data
        setDonationForm({
          organization: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: '',
          donationDate: new Date(),
          notes: ''
        });
        
        // Refresh items after a successful donation
        dispatch(fetchAllItems());
        
        // Switch to the Donated Items tab
        setTabValue(1);
      })
      .catch((error) => {
        console.error('Failed to donate item:', error);
        alert(`Error donating item: ${error.message || 'Server error'}`);
      });
  };

  const handleGenerateCertificate = async (item: Item) => {
    if (!item || !item.id) {
      console.error("Cannot generate certificate: Invalid item");
      return;
    }

    try {
      // Generate donation certificate
      const certificateOptions = {
        reportType: 'donationCertificate' as any,
        title: 'Donation Certificate',
        certificateData: {
          itemName: item.name,
          itemId: item.itemId || item.id,
          organization: typeof item.donatedTo === 'string' ? item.donatedTo : 'Unknown Organization',
          contactPerson: item.contactPerson || 'Unknown',
          donationDate: item.donationDate ? new Date(item.donationDate) : new Date()
        }
      };

      const blob = await generateReport([], certificateOptions);
      setCertificateBlob(blob);
      setSelectedItemForCertificate(item);
      setCertificateDialogOpen(true);
    } catch (error) {
      console.error('Error generating donation certificate:', error);
      alert('Failed to generate donation certificate. Please try again.');
    }
  };

  const handleCloseCertificateDialog = () => {
    setCertificateDialogOpen(false);
    setSelectedItemForCertificate(null);
    setCertificateBlob(null);
  };

  const handleDownloadCertificate = () => {
    if (!certificateBlob || !selectedItemForCertificate) return;

    const url = URL.createObjectURL(certificateBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Donation_Certificate_${selectedItemForCertificate.itemId || selectedItemForCertificate.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getItemAge = (date: string | Date | undefined): string => {
    if (!date) return "N/A";
    try {
      const itemDate = new Date(date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch (error) {
      console.error("Error calculating item age:", error);
      return "Unknown";
    }
  };

  const handleEditItem = (item: Item) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', item);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Donation Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs to switch between eligible and donated items */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
              py: 2
            },
            '& .Mui-selected': {
              color: theme => theme.palette.primary.main,
              fontWeight: 'bold'
            }
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={`For Donation (${eligibleItems.length})`} 
            icon={<DonateIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Donated Items (${donatedItems.length})`} 
            icon={<PrintIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleFilterChange}
                label="Filter by Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="book">Book</MenuItem>
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="accessory">Accessory</MenuItem>
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="stationery">Stationery</MenuItem>
                <MenuItem value="jewelry">Jewelry</MenuItem>
                <MenuItem value="bag">Bag</MenuItem>
                <MenuItem value="id_card">ID Card</MenuItem>
                <MenuItem value="key">Key</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                <MenuItem value="money">Money</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Display */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
      ) : isMobile ? (
        <MobileItemList
          items={paginatedItems}
          onViewItem={handleViewItem}
          onEditItem={isAdmin ? handleEditItem : undefined}
          onClaimItem={tabValue === 0 ? handleOpenDonateDialog : undefined}
          onPrintCertificate={tabValue === 1 ? handleGenerateCertificate : undefined}
          isAdmin={isAdmin}
          showImage={true}
          showClaimButton={tabValue === 0}
          showPrintButton={tabValue === 1}
        />
        ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Type</TableCell>
                {tabValue === 0 ? (
                  <>
                    <TableCell>Found Date</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Storage Location</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Donation Date</TableCell>
                    <TableCell>Donated To</TableCell>
                    <TableCell>Contact Person</TableCell>
                  </>
                )}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemId || "N/A"}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        width: 125, 
                        height: 125, 
                        position: 'relative' 
                      }}>
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                          width="100%"
                          height="100%"
                        sx={{ 
                            cursor: 'pointer',
                            backgroundColor: '#f5f5f5',
                          border: '1px solid #eee',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                          onClick={() => handleViewItem(item)}
                      />
                      </Box>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatToSentenceCase(item.type)}
                        size="small"
                        color={
                          item.type === "electronics"
                            ? "primary"
                            : item.type === "book"
                            ? "secondary"
                            : item.type === "clothing"
                            ? "success"
                            : item.type === "accessory"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    {tabValue === 0 ? (
                      <>
                        <TableCell>{item.foundDate ? formatDate(item.foundDate) : "N/A"}</TableCell>
                        <TableCell>{getItemAge(item.foundDate)}</TableCell>
                        <TableCell>{item.foundLocation || "N/A"}</TableCell>
                        <TableCell>{item.storageLocation || "N/A"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.donationDate ? formatDate(item.donationDate) : "N/A"}</TableCell>
                        <TableCell>{item.donatedTo || "N/A"}</TableCell>
                        <TableCell>{item.contactPerson || "N/A"}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewItem(item)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {tabValue === 0 ? (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenDonateDialog(item)}
                        >
                          <DonateIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleGenerateCertificate(item)}
                        >
                          <PrintIcon />
                        </IconButton>
                      )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tabValue === 0 ? 9 : 8} align="center">
                    {tabValue === 0 ? "No items eligible for donation" : "No donated items found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={currentItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      )}

      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        {viewItem && (
          <>
            <DialogTitle>
              {tabValue === 0 ? "Item Eligible for Donation" : "Donated Item Details"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {viewItem.imageUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Image</Typography>
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="auto"
                        sx={{ 
                          maxHeight: '300px', 
                          objectFit: 'contain',
                          borderRadius: 1,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Item ID</Typography>
                  <Typography variant="body1">{viewItem.itemId || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Item Name</Typography>
                  <Typography variant="body1">{viewItem.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body1">
                    {viewItem.type.charAt(0).toUpperCase() + viewItem.type.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description || "N/A"}
                  </Typography>
                </Grid>
                {viewItem.foundDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Found Date</Typography>
                    <Typography variant="body1">
                      {formatDate(viewItem.foundDate)}
                    </Typography>
                  </Grid>
                )}
                {viewItem.foundLocation && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Found Location</Typography>
                    <Typography variant="body1">
                      {viewItem.foundLocation}
                    </Typography>
                  </Grid>
                )}
                {viewItem.storageLocation && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Storage Location</Typography>
                    <Typography variant="body1">
                      {viewItem.storageLocation}
                    </Typography>
                  </Grid>
                )}
                {viewItem.status === 'donated' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1">Donation Information</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Donation Date</Typography>
                      <Typography variant="body1">
                        {viewItem.donationDate ? formatDate(viewItem.donationDate) : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Donated To</Typography>
                      <Typography variant="body1">
                        {viewItem.donatedTo || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Contact Person</Typography>
                      <Typography variant="body1">
                        {viewItem.contactPerson || "N/A"}
                      </Typography>
                    </Grid>
                    {viewItem.contactEmail && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Contact Email</Typography>
                        <Typography variant="body1">
                          {viewItem.contactEmail}
                        </Typography>
                      </Grid>
                    )}
                    {viewItem.contactPhone && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Contact Phone</Typography>
                        <Typography variant="body1">
                          {viewItem.contactPhone}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                {viewItem.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography variant="body1">{viewItem.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              {tabValue === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DonateIcon />}
                  onClick={() => handleOpenDonateDialog(viewItem)}
                >
                  Donate Item
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={() => handleGenerateCertificate(viewItem)}
                >
                  Print Certificate
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Donation Dialog */}
      <Dialog
        open={donateDialogOpen}
        onClose={handleCloseDonateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Donate Item</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Organization"
                  fullWidth
                  value={donationForm.organization}
                  onChange={(e) => setDonationForm({...donationForm, organization: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Person"
                  fullWidth
                  value={donationForm.contactPerson}
                  onChange={(e) => setDonationForm({...donationForm, contactPerson: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Email"
                  fullWidth
                  type="email"
                  value={donationForm.contactEmail}
                  onChange={(e) => setDonationForm({...donationForm, contactEmail: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Phone"
                  fullWidth
                  value={donationForm.contactPhone}
                  onChange={(e) => setDonationForm({...donationForm, contactPhone: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Donation Date"
                    value={donationForm.donationDate}
                    onChange={(newDate) => setDonationForm({...donationForm, donationDate: newDate || new Date()})}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={4}
                  value={donationForm.notes}
                  onChange={(e) => setDonationForm({...donationForm, notes: e.target.value})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDonateDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitDonation}
            variant="contained" 
            color="primary"
            disabled={
              !donationForm.organization || 
              !donationForm.contactPerson || 
              !donationForm.contactEmail || 
              !donationForm.contactPhone
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCloseCertificateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Donation Certificate</DialogTitle>
        <DialogContent>
          {certificateBlob ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <iframe
                src={URL.createObjectURL(certificateBlob)}
                width="100%"
                height="600px"
                title="Donation Certificate"
                style={{ border: 'none' }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCertificateDialog}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadCertificate}
            disabled={!certificateBlob}
            startIcon={<PdfIcon />}
          >
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ForDonationPage; 