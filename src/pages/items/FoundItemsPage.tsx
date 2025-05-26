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
  InputAdornment,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AssignmentReturn as ClaimIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";
import MobileItemList from "../../components/items/MobileItemList";
import { fetchItemsByStatus, addNewItem, changeItemStatusAPI, clearError, deleteItem } from "../../store/slices/itemsSlice";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { formatToSentenceCase, formatDate } from "../../utils/formatters";

// Helper to check if an item is eligible for donation (older than 3 months)
const isEligibleForDonation = (item: Item): boolean => {
  if (item.status !== 'in_custody') return false;
  
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
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [itemToClaim, setItemToClaim] = useState<Item | null>(null);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [claimFormData, setClaimFormData] = useState({
    name: "",
    type: "student" as "student" | "faculty" | "staff" | "visitor",
    studentId: "",
    employeeId: "",
    email: "",
    phone: "",
    claimDate: new Date().toISOString().split('T')[0],
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Fetch found items when component mounts
  useEffect(() => {
    // Load found items
    dispatch(fetchItemsByStatus('in_custody'));
    
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

  const handleClaimItem = (item: Item) => {
    setViewItem(null);
    setItemToClaim(item);
    setOpenClaimDialog(true);
  };

  const handleCloseClaimDialog = () => {
    setOpenClaimDialog(false);
    setItemToClaim(null);
    setClaimFormData({
      name: "",
      type: "student",
      studentId: "",
      employeeId: "",
      email: "",
      phone: "",
      claimDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleClaimSubmit = async () => {
    if (!itemToClaim?.id) {
      console.error('No item selected or item has no ID');
      return;
    }
    
    try {
      const claimData = {
        id: itemToClaim.id,
        status: 'claimed' as const,
        additionalData: {
          claimedBy: {
            name: claimFormData.name,
            type: claimFormData.type,
            studentId: claimFormData.studentId,
            employeeId: claimFormData.employeeId,
            email: claimFormData.email,
            phone: claimFormData.phone
          },
          claimDate: new Date(claimFormData.claimDate)
        }
      };

      // Update item status to claimed
      await dispatch(changeItemStatusAPI(claimData)).unwrap();
      
      // Refresh both the found items and claimed items lists
      await Promise.all([
        dispatch(fetchItemsByStatus('in_custody')),
        dispatch(fetchItemsByStatus('claimed'))
      ]);
      
      // Close the dialog and reset form
      handleCloseClaimDialog();
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
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
          deleteDate: new Date()
        }
      };

      console.log('Deleting item with data:', deleteData); // Debug log

      // Update item status to deleted
      const result = await dispatch(changeItemStatusAPI(deleteData)).unwrap();
      console.log('Delete result:', result); // Debug log
      
      // Refresh the in custody items list
      await dispatch(fetchItemsByStatus('in_custody'));
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error marking item as deleted:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditItem = (item: Item) => {
    setViewItem(item);
  };

  // Filter items based on search term and type
  const filteredItems = items
    .filter(item => item.status === 'in_custody') // Only show in custody items
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
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
        In Custody
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
          {isAdmin && (
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
          )}
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
          onClaimItem={handleClaimItem}
          showClaimButton={true}
          isAdmin={isAdmin}
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
                <TableCell>Location</TableCell>
                <TableCell>Date Found</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemId}</TableCell>
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
                    <TableCell>{item.foundLocation || "N/A"}</TableCell>
                    <TableCell>
                      {item.foundDate
                        ? new Date(item.foundDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatToSentenceCase(item.status)}
                        color={
                          item.status === "lost"
                            ? "error"
                            : item.status === "in_custody"
                            ? "info"
                            : item.status === "claimed"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewItem(item)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Item">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleEditItem(item)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Process Claim">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleClaimItem(item)}
                              >
                                <ClaimIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
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
      <Dialog
        open={!!viewItem}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        {viewItem && (
          <>
            <DialogTitle>Item Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Item ID</Typography>
                  <Typography variant="body1">
                    {viewItem.itemId || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body1">{viewItem.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body1">
                    {viewItem.type
                      ? viewItem.type.charAt(0).toUpperCase() +
                        viewItem.type.slice(1)
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body1">
                    {viewItem.foundLocation || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Found</Typography>
                  <Typography variant="body1">
                    {viewItem.foundDate
                      ? new Date(viewItem.foundDate).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body1">
                    {formatToSentenceCase(viewItem.status)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description || "N/A"}
                  </Typography>
                </Grid>
                {viewItem.imageUrl && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      mt: 1, 
                      textAlign: 'center', 
                      position: 'relative',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      p: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="400px"
                        sx={{ 
                          maxHeight: '500px', 
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
            onSubmit={async (formData) => {
              try {
                // Add the foundBy information from the current user
                const itemData = {
                  ...formData,
                  foundBy: {
                    name: user?.name || '',
                    type: (user?.role === 'admin' || user?.role === 'superAdmin' ? 'staff' : 'student') as 'student' | 'faculty' | 'staff' | 'visitor',
                    email: user?.email || '',
                  },
                  status: 'in_custody',
                  dateReported: new Date(),
                  foundDate: formData.foundDate || new Date(),
                  foundLocation: formData.foundLocation || '',
                  storageLocation: formData.storageLocation || '',
                };
                
                console.log('Submitting found item:', itemData); // Debug log
                const result = await dispatch(addNewItem(itemData)).unwrap();
                console.log('Item added successfully:', result); // Debug log
                
                // Refresh the list
                await dispatch(fetchItemsByStatus('in_custody'));
                handleCloseAddDialog();
              } catch (error) {
                console.error('Error adding found item:', error);
                // You might want to show an error message to the user here
              }
            }}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog
        open={openClaimDialog}
        onClose={handleCloseClaimDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Claim</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                value={claimFormData.name}
                onChange={(e) =>
                  setClaimFormData({ ...claimFormData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={claimFormData.type}
                  label="Type"
                  onChange={(e) =>
                    setClaimFormData({
                      ...claimFormData,
                      type: e.target.value as "student" | "faculty" | "staff" | "visitor",
                    })
                  }
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="visitor">Visitor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {claimFormData.type === "student" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={claimFormData.studentId}
                  onChange={(e) =>
                    setClaimFormData({
                      ...claimFormData,
                      studentId: e.target.value,
                    })
                  }
                />
              </Grid>
            )}
            {(claimFormData.type === "faculty" ||
              claimFormData.type === "staff") && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={claimFormData.employeeId}
                  onChange={(e) =>
                    setClaimFormData({
                      ...claimFormData,
                      employeeId: e.target.value,
                    })
                  }
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={claimFormData.email}
                onChange={(e) =>
                  setClaimFormData({ ...claimFormData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={claimFormData.phone}
                onChange={(e) =>
                  setClaimFormData({ ...claimFormData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Claim"
                type="date"
                value={claimFormData.claimDate}
                onChange={(e) =>
                  setClaimFormData({ ...claimFormData, claimDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Cancel</Button>
          <Button onClick={handleClaimSubmit} variant="contained">
            Submit Claim
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {itemToDelete?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>ID:</strong> {itemToDelete?.itemId}
                </Typography>
                <Typography variant="body1">
                  <strong>Type:</strong> {itemToDelete?.type ? itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1) : 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {itemToDelete?.status ? itemToDelete.status.charAt(0).toUpperCase() + itemToDelete.status.slice(1) : 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Date Found:</strong> {itemToDelete?.foundDate ? new Date(itemToDelete.foundDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
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

export default FoundItemsPage;
