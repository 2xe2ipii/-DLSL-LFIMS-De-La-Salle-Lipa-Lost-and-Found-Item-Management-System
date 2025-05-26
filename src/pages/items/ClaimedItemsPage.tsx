import React, { useState, useEffect } from "react";
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
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item } from "../../types/item";
import { fetchItemsByStatus, clearError, changeItemStatusAPI } from "../../store/slices/itemsSlice";
import { generateReport } from "../../services/reportService";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import MobileItemList from "../../components/items/MobileItemList";
import { formatToSentenceCase, formatDate } from "../../utils/formatters";

const ClaimedItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedItemForCertificate, setSelectedItemForCertificate] = useState<Item | null>(null);
  const [certificateBlob, setCertificateBlob] = useState<Blob | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Fetch claimed items when component mounts
  useEffect(() => {
    dispatch(fetchItemsByStatus('claimed'));
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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

  const handleGenerateCertificate = async (item: Item) => {
    if (!item || !item.id) {
      console.error("Cannot generate certificate: Invalid item");
      return;
    }

    try {
      const certificateOptions = {
        reportType: 'claimCertificate' as any,
        title: 'Claim Certificate',
        certificateData: {
          itemName: item.name,
          itemId: item.itemId || item.id,
          claimedBy: typeof item.claimedBy === 'string' ? item.claimedBy : item.claimedBy?.name || 'Unknown',
          claimDate: item.claimedDate ? new Date(item.claimedDate) : new Date(),
          organization: 'De La Salle Lipa',
          contactPerson: typeof item.claimedBy === 'string' ? item.claimedBy : item.claimedBy?.name || 'Unknown',
          donationDate: item.claimedDate ? new Date(item.claimedDate) : new Date()
        }
      };

      const blob = await generateReport([], certificateOptions);
      setCertificateBlob(blob);
      setSelectedItemForCertificate(item);
      setCertificateDialogOpen(true);
    } catch (error) {
      console.error('Error generating claim certificate:', error);
      alert('Failed to generate claim certificate. Please try again.');
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
    a.download = `Claim_Certificate_${selectedItemForCertificate.itemId || selectedItemForCertificate.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;
    
    try {
      const deleteData = {
        id: itemToDelete.id,
        status: 'deleted' as const,
        additionalData: {
          deletedBy: {
            name: user?.name || '',
            type: (user?.role === 'admin' || user?.role === 'superAdmin' ? 'staff' : 'student') as 'student' | 'faculty' | 'staff' | 'visitor',
            email: user?.email || '',
          },
          deleteDate: new Date(),
          previousStatus: itemToDelete.status // Store the current status as previous status
        }
      };

      console.log('Deleting item with data:', deleteData); // Debug log

      // Update item status to deleted
      const result = await dispatch(changeItemStatusAPI(deleteData)).unwrap();
      console.log('Delete result:', result); // Debug log
      
      // Only refresh the claimed items list
      await dispatch(fetchItemsByStatus('claimed'));
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error marking item as deleted:', error);
    }
  };

  // Filter items based on search term and type
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Claimed Items
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
      ) : isMobile ? (
        <MobileItemList
          items={paginatedItems}
          onViewItem={handleViewItem}
          onPrintCertificate={handleGenerateCertificate}
          showPrintButton={true}
          showImage={true}
        />
        ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Claimed By</TableCell>
                <TableCell>Claim Date</TableCell>
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
                      {formatToSentenceCase(item.type)}
                    </TableCell>
                    <TableCell>
                      {typeof item.claimedBy === 'string' 
                        ? item.claimedBy 
                        : item.claimedBy?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.claimedDate
                        ? formatDate(item.claimedDate)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewItem(item)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                          onClick={() => handleGenerateCertificate(item)}
                      >
                        <PrintIcon />
                      </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No claimed items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
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
            <DialogTitle>Item Details</DialogTitle>
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
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body1">{viewItem.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body1">
                    {formatToSentenceCase(viewItem.type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Claimed By</Typography>
                  <Typography variant="body1">
                    {typeof viewItem.claimedBy === 'string' 
                      ? viewItem.claimedBy 
                      : viewItem.claimedBy?.name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Claim Date</Typography>
                  <Typography variant="body1">
                    {viewItem.claimedDate
                      ? formatDate(viewItem.claimedDate)
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={() => handleGenerateCertificate(viewItem)}
              >
                Print Certificate
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCloseCertificateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Claim Certificate</DialogTitle>
        <DialogContent>
          {certificateBlob ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <iframe
                src={URL.createObjectURL(certificateBlob)}
                width="100%"
                height="600px"
                title="Claim Certificate"
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
            startIcon={<PrintIcon />}
          >
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'error.main',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          typography: 'h6'
        }}>
          <WarningIcon color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Are you sure you want to delete this item?
            </Typography>
            <Box sx={{ 
              bgcolor: 'error.main', 
              p: 2, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}>
              <WarningIcon sx={{ color: 'white', mt: 0.5 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                This action cannot be undone. The item will be moved to the Deleted Items tab for record-keeping purposes.
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
                Item Details:
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {itemToDelete?.name}
              </Typography>
              <Typography variant="body1">
                <strong>ID:</strong> {itemToDelete?.itemId}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {itemToDelete?.type ? 
                  itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ 
              minWidth: 100,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ 
              minWidth: 100,
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimedItemsPage;
