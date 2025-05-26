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
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";
import { UserRole } from "../../types/user";
import { fetchItemsByStatus, clearError } from "../../store/slices/itemsSlice";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const DonatedItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  const { user } = useAppSelector((state) => state.auth);

  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewItem, setViewItem] = useState<Item | null>(null);

  // Fetch donated items when component mounts
  useEffect(() => {
    dispatch(fetchItemsByStatus('donated'));
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handlePrintDonationCertificate = (item: Item) => {
    // In a real app, this would trigger a print process
    window.alert(`Printing donation certificate for: ${item.name}`);
  };

  // Filter items based on search term and filter type
  const filteredItems = items.filter((item) => {
    // Ensure we only display items with 'donated' status
    if (item.status !== 'donated') return false;
    
    const matchesSearch =
      (item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
      (item.foundBy && typeof item.foundBy === 'object' && item.foundBy.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesType = filterType ? item.type === filterType : true;

    return matchesSearch && matchesType;
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Donated Items
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
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

      {/* Items Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Found Date</TableCell>
                <TableCell>Donation Date</TableCell>
                <TableCell>Found Location</TableCell>
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
                      {item.type
                        ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                        : "N/A"}
                    </TableCell>
                    <TableCell>{item.foundDate ? formatDate(new Date(item.foundDate)) : "N/A"}</TableCell>
                    <TableCell>
                      {/* For simplicity's sake, we're using the modification date as donation date */}
                      {formatDate(new Date())}
                    </TableCell>
                    <TableCell>{item.foundLocation || "N/A"}</TableCell>
                    <TableCell>
                      {isAdmin && (
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
                            onClick={() => handlePrintDonationCertificate(item)}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No donated items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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

      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        {viewItem && (
          <>
            <DialogTitle>Donated Item Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
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
                    {viewItem.type ? (viewItem.type.charAt(0).toUpperCase() + viewItem.type.slice(1)) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Color</Typography>
                  <Typography variant="body1">
                    {viewItem.color || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Brand</Typography>
                  <Typography variant="body1">
                    {viewItem.brand || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Found</Typography>
                  <Typography variant="body1">
                    {formatDate(viewItem.foundDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Donated</Typography>
                  <Typography variant="body1">
                    {formatDate(viewItem.donationDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Found Location</Typography>
                  <Typography variant="body1">
                    {viewItem.foundLocation || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Reported</Typography>
                  <Typography variant="body1">
                    {formatDate(viewItem.dateReported)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Found By</Typography>
                  <Typography variant="body1">
                    {viewItem.foundBy && typeof viewItem.foundBy === 'object' ? viewItem.foundBy.name || "Anonymous" : "Anonymous"}
                    {viewItem.foundBy && typeof viewItem.foundBy === 'object' && viewItem.foundBy.type &&
                      ` (${
                        viewItem.foundBy.type.charAt(0).toUpperCase() +
                        viewItem.foundBy.type.slice(1)
                      })`}
                  </Typography>
                </Grid>
                {viewItem.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Additional Notes</Typography>
                    <Typography variant="body1">{viewItem.notes}</Typography>
                  </Grid>
                )}
                {viewItem.imageUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Image</Typography>
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="auto"
                        sx={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={() => handlePrintDonationCertificate(viewItem)}
              >
                Print Certificate
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DonatedItemsPage;
