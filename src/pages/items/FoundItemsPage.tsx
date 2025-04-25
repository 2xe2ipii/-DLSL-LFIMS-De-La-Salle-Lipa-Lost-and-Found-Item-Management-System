import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AssignmentReturn as ClaimIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";
import { fetchItemsByStatus, addNewItem, changeItemStatusAPI, clearError } from "../../store/slices/itemsSlice";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";

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

const FoundItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [claimFormData, setClaimFormData] = useState({
    name: "",
    type: "student" as "student" | "faculty" | "staff" | "visitor",
    studentId: "",
    employeeId: "",
    email: "",
    phone: "",
  });

  // Fetch found items when component mounts
  useEffect(() => {
    // Load found items
    dispatch(fetchItemsByStatus('found'));
    
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

  const handleAddItem = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleSubmitItem = (newItem: Partial<Item>) => {
    // Submit the new item to the API
    dispatch(addNewItem({
      ...newItem,
      status: 'found'
    }))
      .unwrap()
      .then(() => {
        handleCloseAddDialog();
      })
      .catch((error) => {
        console.error('Failed to add item:', error);
      });
  };

  const handleClaimItem = (item: Item) => {
    console.log("Selected item for claim - Full item data:", JSON.stringify(item, null, 2)); // More detailed logging
    if (!item || !item.id) {
      console.error("Invalid item selected for claim - Item structure:", item);
      alert("Cannot claim this item at the moment. Please try again.");
      return;
    }
    setClaimFormData({
      name: '',
      type: 'student',
      studentId: '',
      employeeId: '',
      email: '',
      phone: '',
    });
    setOpenClaimDialog(true);
    setViewItem(item);
  };

  const handleCloseClaimDialog = () => {
    setOpenClaimDialog(false);
  };

  const handleClaimFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClaimFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClaimTypeChange = (e: SelectChangeEvent<string>) => {
    setClaimFormData(prev => ({ 
      ...prev, 
      type: e.target.value as "student" | "faculty" | "staff" | "visitor" 
    }));
  };

  const handleSubmitClaim = () => {
    if (!viewItem || !viewItem.id) {
      console.error("Cannot claim item: No valid ID found");
      return;
    }

    const claimData = {
      id: viewItem.id,
      status: 'claimed' as 'lost' | 'found' | 'claimed' | 'donated',
      additionalData: { claimedBy: claimFormData }
    };

    console.log("Submitting claim data:", JSON.stringify(claimData, null, 2)); // Log the data being sent

    dispatch(changeItemStatusAPI(claimData))
      .unwrap()
      .then(() => {
        handleCloseClaimDialog();
        // Refresh items
        dispatch(fetchItemsByStatus('found'));
      })
      .catch((error) => {
        console.error('Failed to claim item:', error);
        alert(`Error claiming item: ${error.message || 'Server error'}`);
      });
  };

  // Filter items based on search term and filter type
  const filteredItems = items.filter((item) => {
    // Ensure we only display items with 'found' status
    if (item.status !== 'found') return false;
    
    // Exclude items eligible for donation (older than 3 months)
    if (isEligibleForDonation(item)) return false;
    
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
        Found Items
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
          <Grid
            item
            xs={12}
            sm={12}
            md={5}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Register Found Item
            </Button>
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
                <TableCell>Found Location</TableCell>
                <TableCell>Storage Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemId || "N/A"}</TableCell>
                    <TableCell>
                      {item.imageUrl ? (
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          sx={{ 
                            objectFit: 'cover', 
                            borderRadius: 1,
                            border: '1px solid #eee',
                            backgroundColor: '#f5f5f5'
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            border: '1px solid #eee'
                          }}
                        >
                          <ImageNotSupportedIcon color="disabled" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.type
                        ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.foundDate ? formatDate(new Date(item.foundDate)) : 'N/A'}
                    </TableCell>
                    <TableCell>{item.foundLocation || "N/A"}</TableCell>
                    <TableCell>{item.storageLocation || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewItem(item)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleClaimItem(item)}
                      >
                        <ClaimIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No found items found
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
            <DialogTitle>Found Item Details</DialogTitle>
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
                <Grid item xs={12}>
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
                  <Typography variant="subtitle2">Found Date</Typography>
                  <Typography variant="body1">
                    {formatDate(viewItem.foundDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Found Location</Typography>
                  <Typography variant="body1">
                    {viewItem.foundLocation || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Storage Location</Typography>
                  <Typography variant="body1">
                    {viewItem.storageLocation || "N/A"}
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
                    <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="300px"
                        sx={{ 
                          maxHeight: '350px', 
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
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
                color="primary" 
                startIcon={<ClaimIcon />}
                onClick={() => handleClaimItem(viewItem)}
              >
                Claim Item
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Register Found Item</DialogTitle>
        <DialogContent>
          <ItemForm 
            formType="found"
            onSubmit={handleSubmitItem}
            onCancel={handleCloseAddDialog}
            initialData={{ status: "found" }}
          />
        </DialogContent>
      </Dialog>

      {/* Claim Item Dialog */}
      <Dialog 
        open={openClaimDialog} 
        onClose={handleCloseClaimDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Claim Item</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Item Details:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {viewItem.name} ({viewItem.itemId || 'No ID'})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Found on: {viewItem.foundDate ? formatDate(viewItem.foundDate) : 'N/A'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Claimant Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    name="name"
                    value={claimFormData.name}
                    onChange={handleClaimFormChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={claimFormData.type}
                      label="Type"
                      onChange={handleClaimTypeChange}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="faculty">Faculty</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="visitor">Visitor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {claimFormData.type === 'student' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Student ID"
                      name="studentId"
                      value={claimFormData.studentId}
                      onChange={handleClaimFormChange}
                    />
                  </Grid>
                )}
                
                {(claimFormData.type === 'faculty' || claimFormData.type === 'staff') && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Employee ID"
                      name="employeeId"
                      value={claimFormData.employeeId}
                      onChange={handleClaimFormChange}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={claimFormData.email}
                    onChange={handleClaimFormChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={claimFormData.phone}
                    onChange={handleClaimFormChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmitClaim}
            disabled={!claimFormData.name || 
              (claimFormData.type === 'student' && !claimFormData.studentId) ||
              ((claimFormData.type === 'faculty' || claimFormData.type === 'staff') && !claimFormData.employeeId)
            }
          >
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoundItemsPage;
