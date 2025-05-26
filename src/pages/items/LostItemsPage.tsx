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
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Divider,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FindInPage as FindIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType, Person } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";
import MobileItemList from "../../components/items/MobileItemList";
import { fetchItemsByStatus, addNewItem, clearError, deleteItem, changeItemStatusAPI } from "../../store/slices/itemsSlice";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { formatToSentenceCase, formatDate } from "../../utils/formatters";

const LostItemsPage: React.FC = () => {
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
  const [openInquireDialog, setOpenInquireDialog] = useState(false);
  const [inquiryFormData, setInquiryFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Fetch lost items when component mounts
  useEffect(() => {
    // Load missing items
    dispatch(fetchItemsByStatus('missing'));
    
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
    setOpenInquireDialog(false);
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

  const handleInquire = (item: Item) => {
    setViewItem(null);
    setOpenInquireDialog(true);
  };

  const handleCloseInquireDialog = () => {
    setOpenInquireDialog(false);
    setInquiryFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleInquirySubmit = async () => {
    // Handle inquiry submission
    handleCloseInquireDialog();
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
          deleteDate: new Date(),
          previousStatus: itemToDelete.status // Store the current status as previous status
        }
      };

      console.log('Deleting item with data:', deleteData); // Debug log

      // Update item status to deleted
      const result = await dispatch(changeItemStatusAPI(deleteData)).unwrap();
      console.log('Delete result:', result); // Debug log
      
      // Only refresh the missing items list
      await dispatch(fetchItemsByStatus('missing'));
      
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

  // Filter items based on search term, type, and user role
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    // For non-admin users, only show their own items
    const isUserItem = !isAdmin && user && 
      typeof item.reportedBy === 'object' && 
      item.reportedBy !== null && 
      'id' in item.reportedBy && 
      item.reportedBy.id === user.id;
    return matchesSearch && matchesType && (isAdmin || isUserItem);
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Missing Items
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
              color="primary"
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
            >
              Report Lost Item
            </Button>
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
          onInquireItem={!isAdmin ? handleInquire : undefined}
          showInquireButton={!isAdmin}
          isAdmin={isAdmin}
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
                <TableCell>Date Lost</TableCell>
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
                    <TableCell>{item.location || "N/A"}</TableCell>
                    <TableCell>
                      {item.lostDate
                        ? new Date(item.lostDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatToSentenceCase(item.status)}
                        color={
                          item.status === "lost"
                            ? "error"
                            : item.status === "found"
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
                          <Tooltip title="Delete Item">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No lost items found
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
                    {viewItem.location || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Lost</Typography>
                  <Typography variant="body1">
                    {viewItem.lostDate
                      ? new Date(viewItem.lostDate).toLocaleDateString()
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
                    <Typography variant="subtitle2">Image</Typography>
                    <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="400px"
                        padding={16}
                        sx={{ 
                          maxHeight: '500px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
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
        <DialogTitle>Report Lost Item</DialogTitle>
        <DialogContent>
          <ItemForm
            formType="lost"
            onSubmit={async (formData) => {
              try {
                // Add the reportedBy information and ensure correct status
                const itemData = {
                  ...formData,
                  reportedBy: {
                    name: user?.name || '',
                    type: (user?.role === 'admin' || user?.role === 'superAdmin' ? 'staff' : 'student') as 'student' | 'faculty' | 'staff' | 'visitor',
                    email: user?.email || '',
                  },
                  status: 'missing',
                  dateReported: new Date(),
                  lostDate: formData.lostDate || new Date(),
                  location: formData.location || '',
                };
                
                console.log('Submitting missing item:', itemData); // Debug log
                const result = await dispatch(addNewItem(itemData)).unwrap();
                console.log('Item added successfully:', result); // Debug log
                
                // Refresh the list
                await dispatch(fetchItemsByStatus('missing'));
                handleCloseAddDialog();
              } catch (error) {
                console.error('Error adding missing item:', error);
              }
            }}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Inquire Dialog */}
      <Dialog
        open={openInquireDialog}
        onClose={handleCloseInquireDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Inquire About Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                value={inquiryFormData.name}
                onChange={(e) =>
                  setInquiryFormData({ ...inquiryFormData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={inquiryFormData.email}
                onChange={(e) =>
                  setInquiryFormData({ ...inquiryFormData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={inquiryFormData.phone}
                onChange={(e) =>
                  setInquiryFormData({ ...inquiryFormData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={inquiryFormData.message}
                onChange={(e) =>
                  setInquiryFormData({
                    ...inquiryFormData,
                    message: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInquireDialog}>Cancel</Button>
          <Button onClick={handleInquirySubmit} variant="contained">
            Submit Inquiry
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
          pb: 2
        }}>
          <WarningIcon color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="text.primary">
              Are you sure you want to delete this item?
            </Typography>
            <Box sx={{ 
              bgcolor: 'error.main', 
              p: 2, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <WarningIcon sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                This action cannot be undone. The item will be moved to the Deleted Items tab.
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Item Details:
              </Typography>
              <Typography variant="body1">
                Name: {itemToDelete?.name}
              </Typography>
              <Typography variant="body1">
                ID: {itemToDelete?.itemId}
              </Typography>
              <Typography variant="body1">
                Type: {itemToDelete?.type ? itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: '1px solid',
          borderColor: 'divider'
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

export default LostItemsPage;
