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
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemStatus } from "../../types/item";
import { fetchItemsByStatus, restoreItem, clearError, deleteItem, changeItemStatusAPI } from "../../store/slices/itemsSlice";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { formatToSentenceCase } from "../../utils/formatters";

interface ItemWithAdditionalData extends Item {
  additionalData?: {
    previousStatus?: ItemStatus | 'lost' | 'found';
    deletedBy?: {
      name: string;
      type: string;
      email: string;
    };
    deleteDate?: Date;
    restoredBy?: {
      name: string;
      type: string;
      email: string;
    };
    restoreDate?: Date;
  };
}

const DeletedItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [itemToRestore, setItemToRestore] = useState<Item | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // Check if user is admin or superAdmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // Fetch deleted items when component mounts
  useEffect(() => {
    dispatch(fetchItemsByStatus('deleted'));
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

  const handleRestoreItem = (item: Item) => {
    setItemToRestore(item);
    setRestoreDialogOpen(true);
  };

  const handleCloseRestoreDialog = () => {
    setRestoreDialogOpen(false);
    setItemToRestore(null);
  };

  const handleRestoreConfirm = async () => {
    if (!itemToRestore?.id) return;
    
    try {
      const result = await dispatch(restoreItem({ 
        id: itemToRestore.id
      })).unwrap();
      
      console.log('Restore result:', result); // Debug log
      
      // Refresh the deleted items list
      await dispatch(fetchItemsByStatus('deleted'));
      
      setRestoreDialogOpen(false);
      setItemToRestore(null);
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const handleClearAllClick = () => {
    setClearAllDialogOpen(true);
  };

  const handleClearAllCancel = () => {
    setClearAllDialogOpen(false);
  };

  const handleClearAllConfirm = async () => {
    try {
      // Get all deleted item IDs and filter out any undefined IDs
      const deletedItemIds = items
        .map(item => item.id)
        .filter((id): id is string => typeof id === 'string');
      
      if (deletedItemIds.length === 0) {
        console.error('No valid items to delete');
        return;
      }
      
      // Permanently delete all items
      await Promise.all(deletedItemIds.map(id => dispatch(deleteItem(id))));
      
      // Refresh the deleted items list
      await dispatch(fetchItemsByStatus('deleted'));
      
      setClearAllDialogOpen(false);
    } catch (error) {
      console.error('Error clearing deleted items:', error);
    }
  };

  // Filter items based on search term and type
  const filteredItems = items.filter((item) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>
          Deleted Items
        </Typography>
        {items.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAllClick}
            sx={{
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
          >
            Clear All Deleted Items
          </Button>
        )}
      </Box>

      {!isAdmin && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You don't have permission to restore deleted items.
        </Alert>
      )}

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
                <TableCell>Date Deleted</TableCell>
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
                    <TableCell>{item.foundLocation || item.location || "N/A"}</TableCell>
                    <TableCell>
                      {item.deletedAt
                        ? new Date(item.deletedAt).toLocaleDateString()
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
                        {isAdmin && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleRestoreItem(item)}
                          >
                            <RestoreIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No deleted items found
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
                    {viewItem.foundLocation || viewItem.location || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Deleted</Typography>
                  <Typography variant="body1">
                    {viewItem.deletedAt
                      ? new Date(viewItem.deletedAt).toLocaleDateString()
                      : "N/A"}
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

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={handleCloseRestoreDialog}
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
          color: 'success.main',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          typography: 'h6'
        }}>
          <RestoreIcon color="success" />
          Restore Item
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Are you sure you want to restore this item?
            </Typography>
            <Box sx={{ 
              bgcolor: 'success.main', 
              p: 2, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}>
              <RestoreIcon sx={{ color: 'white', mt: 0.5 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                This item will be restored to its previous state: {
                  (() => {
                    const previousStatus = itemToRestore && (itemToRestore as ItemWithAdditionalData).additionalData?.previousStatus;
                    if (!previousStatus) return 'Missing';
                    
                    if (previousStatus === 'lost' || previousStatus === 'missing') return 'Missing';
                    if (previousStatus === 'found') return 'In Custody';
                    if (previousStatus === 'claimed') return 'Claimed';
                    if (previousStatus === 'donated') return 'Donated';
                    return formatToSentenceCase(previousStatus);
                  })()
                }
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
                <strong>Name:</strong> {itemToRestore?.name}
              </Typography>
              <Typography variant="body1">
                <strong>ID:</strong> {itemToRestore?.itemId}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {itemToRestore?.type ? 
                  itemToRestore.type.charAt(0).toUpperCase() + itemToRestore.type.slice(1) : 'N/A'}
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
            onClick={handleCloseRestoreDialog} 
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
            onClick={handleRestoreConfirm} 
            color="success" 
            variant="contained"
            startIcon={<RestoreIcon />}
            sx={{ 
              minWidth: 100,
              '&:hover': {
                bgcolor: 'success.dark'
              }
            }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={handleClearAllCancel}
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
          Clear All Deleted Items
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Are you sure you want to permanently delete all items?
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
                This action cannot be undone. All items in the Deleted Items tab will be permanently removed from the system.
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
                Summary:
              </Typography>
              <Typography variant="body1">
                <strong>Total Items to Delete:</strong> {items.length}
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
            onClick={handleClearAllCancel} 
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
            onClick={handleClearAllConfirm} 
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
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeletedItemsPage; 