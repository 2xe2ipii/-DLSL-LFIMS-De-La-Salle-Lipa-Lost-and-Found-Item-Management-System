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
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType, Person } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";
import { fetchItemsByStatus, addNewItem, clearError } from "../../store/slices/itemsSlice";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const LostItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);

  // Fetch lost items when component mounts
  useEffect(() => {
    // Load lost items
    dispatch(fetchItemsByStatus('lost'));
    
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
      status: 'lost'
    }))
      .unwrap()
      .then(() => {
        handleCloseAddDialog();
      })
      .catch((error) => {
        console.error('Failed to add item:', error);
      });
  };

  // Filter items based on search term and filter type
  const filteredItems = items.filter((item) => {
    // Ensure we only display items with 'lost' status
    if (item.status !== 'lost') return false;
    
    const matchesSearch =
      (item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
      (item.reportedBy && typeof item.reportedBy === 'object' && item.reportedBy.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

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
        Lost Items
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
          <Grid
            item
            xs={12}
            sm={12}
            md={4}
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
              Report Lost Item
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="lost items table">
          <TableHead>
            <TableRow>
              <TableCell>Item ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date Reported</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No lost items found
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow hover>
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
                            cursor: 'pointer',
                            border: '1px solid #ddd',
                            backgroundColor: '#f5f5f5'
                          }}
                          onClick={() => handleViewItem(item)}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '1px solid #ddd'
                          }}
                          onClick={() => handleViewItem(item)}
                        >
                          <ImageNotSupportedIcon />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.type.charAt(0).toUpperCase() + item.type.slice(1)} 
                        size="small" 
                        color={
                          item.type === "electronics" 
                            ? "primary" 
                            : item.type === "accessory" 
                              ? "secondary"
                              : item.type === "book"
                                ? "success"
                                : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{item.description?.substring(0, 50) || "N/A"}</TableCell>
                    <TableCell>{formatDate(item.dateReported)}</TableCell>
                    <TableCell>{item.location || "N/A"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewItem(item)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
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

      {/* Add Lost Item Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Report Lost Item</DialogTitle>
        <DialogContent>
          <ItemForm
            formType="lost"
            onSubmit={handleSubmitItem}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        {viewItem && (
          <>
            <DialogTitle>Lost Item Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {viewItem.imageUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Image</Typography>
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <ImageWithFallback
                        src={viewItem.imageUrl}
                        alt={viewItem.name}
                        width="100%"
                        height="auto"
                        sx={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Item ID</Typography>
                  <Typography variant="body1">{viewItem.itemId || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Item Name</Typography>
                  <Typography variant="body1">{viewItem.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Type</Typography>
                  <Typography variant="body1">
                    {viewItem.type ? (viewItem.type.charAt(0).toUpperCase() + viewItem.type.slice(1)) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description || "N/A"}
                  </Typography>
                </Grid>
                {viewItem.color && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Color</Typography>
                    <Typography variant="body1">{viewItem.color}</Typography>
                  </Grid>
                )}
                {viewItem.brand && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Brand</Typography>
                    <Typography variant="body1">{viewItem.brand}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Date Reported</Typography>
                  <Typography variant="body1">{formatDate(viewItem.dateReported)}</Typography>
                </Grid>
                {viewItem.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Last Seen Location</Typography>
                    <Typography variant="body1">{viewItem.location}</Typography>
                  </Grid>
                )}
                {viewItem.foundLocation && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Found Location</Typography>
                    <Typography variant="body1">{viewItem.foundLocation}</Typography>
                  </Grid>
                )}
                {viewItem.foundDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Date Found</Typography>
                    <Typography variant="body1">{formatDate(viewItem.foundDate)}</Typography>
                  </Grid>
                )}
                {viewItem && viewItem.reportedBy && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Reported By</Typography>
                    <Box sx={{ pl: 2 }}>
                      {typeof viewItem.reportedBy === 'object' && 'name' in viewItem.reportedBy ? (
                        <>
                          <Typography variant="body2">
                            <strong>Name:</strong> {viewItem.reportedBy.name}
                          </Typography>
                          {'email' in viewItem.reportedBy && viewItem.reportedBy.email && (
                            <Typography variant="body2">
                              <strong>Email:</strong> {viewItem.reportedBy.email}
                            </Typography>
                          )}
                          {'phone' in viewItem.reportedBy && viewItem.reportedBy.phone && (
                            <Typography variant="body2">
                              <strong>Phone:</strong> {viewItem.reportedBy.phone}
                            </Typography>
                          )}
                          {'type' in viewItem.reportedBy && (
                            <Typography variant="body2">
                              <strong>Type:</strong> {viewItem.reportedBy.type}
                            </Typography>
                          )}
                          {'studentId' in viewItem.reportedBy && viewItem.reportedBy.studentId && (
                            <Typography variant="body2">
                              <strong>Student ID:</strong> {viewItem.reportedBy.studentId}
                            </Typography>
                          )}
                          {'employeeId' in viewItem.reportedBy && viewItem.reportedBy.employeeId && (
                            <Typography variant="body2">
                              <strong>Employee ID:</strong> {viewItem.reportedBy.employeeId}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2">
                          <strong>Reported By:</strong> {typeof viewItem.reportedBy === 'string' ? viewItem.reportedBy : 'Anonymous'}
                        </Typography>
                      )}
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
    </Box>
  );
};

export default LostItemsPage;
