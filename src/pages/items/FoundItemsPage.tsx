import React, { useState } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AssignmentReturn as ClaimIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";

// Mock data for found items
const generateMockFoundItems = (): Item[] => {
  const types: ItemType[] = [
    "book",
    "electronics",
    "clothing",
    "accessory",
    "document",
    "other",
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `found-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    name: `Found Item ${i + 1}`,
    description: `Description for found item ${i + 1}`,
    color: ["Red", "Blue", "Black", "White", "Green"][
      Math.floor(Math.random() * 5)
    ],
    brand: ["Brand A", "Brand B", "Brand C"][Math.floor(Math.random() * 3)],
    dateReported: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
    status: "found",
    storageLocation: ["Shelf A", "Drawer B", "Cabinet C", "Box 1", "Box 2"][
      Math.floor(Math.random() * 5)
    ],
    foundLocation: ["Canteen", "Library", "Gymnasium", "Classroom", "Hallway"][
      Math.floor(Math.random() * 5)
    ],
    foundBy: {
      id: `person-${i + 1}`,
      name: `Finder ${i + 1}`,
      type: ["student", "faculty", "staff", "visitor"][
        Math.floor(Math.random() * 4)
      ] as "student" | "faculty" | "staff" | "visitor",
      studentId: `ST${200000 + i}`,
    },
    foundDate: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
  }));
};

const mockFoundItems = generateMockFoundItems();

const FoundItemsPage: React.FC = () => {
  // In a real app, we would fetch this from the Redux store or API
  // const { items } = useAppSelector((state) => state.items);
  // const foundItems = items.filter(item => item.status === 'found');
  const foundItems = mockFoundItems;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);

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
    // Mock implementation - in a real app, this would dispatch to Redux
    alert("New found item submitted: " + JSON.stringify(newItem));
    handleCloseAddDialog();
  };

  const handleClaimItem = () => {
    setOpenClaimDialog(true);
  };

  const handleCloseClaimDialog = () => {
    setOpenClaimDialog(false);
  };

  // Filter items based on search term and filter type
  const filteredItems = foundItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.foundBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType ? item.type === filterType : true;

    return matchesSearch && matchesType;
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Found Items
      </Typography>

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
              Log Found Item
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date Found</TableCell>
              <TableCell>Storage Location</TableCell>
              <TableCell>Found By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        item.type.charAt(0).toUpperCase() + item.type.slice(1)
                      }
                      size="small"
                      color={
                        item.type === "electronics"
                          ? "primary"
                          : item.type === "book"
                          ? "secondary"
                          : item.type === "document"
                          ? "info"
                          : item.type === "clothing"
                          ? "success"
                          : item.type === "accessory"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {item.foundDate ? formatDate(item.foundDate) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {item.storageLocation || "Not specified"}
                  </TableCell>
                  <TableCell>{item.foundBy?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewItem(item)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      title="Edit Item"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={handleClaimItem}
                      title="Process Claim"
                    >
                      <ClaimIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No found items found.
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
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {viewItem.name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={
                    viewItem.type.charAt(0).toUpperCase() +
                    viewItem.type.slice(1)
                  }
                  color={
                    viewItem.type === "electronics"
                      ? "primary"
                      : viewItem.type === "book"
                      ? "secondary"
                      : viewItem.type === "document"
                      ? "info"
                      : viewItem.type === "clothing"
                      ? "success"
                      : viewItem.type === "accessory"
                      ? "warning"
                      : "default"
                  }
                  sx={{ mr: 1 }}
                />
                <Chip label="Found" color="info" />
              </Box>

              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {viewItem.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date Found:</strong>{" "}
                    {viewItem.foundDate
                      ? formatDate(viewItem.foundDate)
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Found Location:</strong>{" "}
                    {viewItem.foundLocation || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Storage Location:</strong>{" "}
                    {viewItem.storageLocation || "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date Reported:</strong>{" "}
                    {formatDate(viewItem.dateReported)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Color:</strong> {viewItem.color || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Brand:</strong> {viewItem.brand || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Finder Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {viewItem.foundBy?.name || "Unknown"}
                </Typography>
                {viewItem.foundBy?.type && (
                  <Typography variant="body2">
                    <strong>Type:</strong>{" "}
                    {viewItem.foundBy.type.charAt(0).toUpperCase() +
                      viewItem.foundBy.type.slice(1)}
                  </Typography>
                )}
                {viewItem.foundBy?.studentId && (
                  <Typography variant="body2">
                    <strong>Student ID:</strong> {viewItem.foundBy.studentId}
                  </Typography>
                )}
                {viewItem.foundBy?.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {viewItem.foundBy.email}
                  </Typography>
                )}
                {viewItem.foundBy?.phone && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {viewItem.foundBy.phone}
                  </Typography>
                )}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button variant="contained" color="primary">
                Edit
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleClaimItem}
              >
                Process Claim
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add New Found Item Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Found Item</DialogTitle>
        <DialogContent>
          <ItemForm
            formType="found"
            onSubmit={handleSubmitItem}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Claim Process Dialog */}
      <Dialog
        open={openClaimDialog}
        onClose={handleCloseClaimDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Process Item Claim</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the form below to process a claim for this item.
          </Typography>
          {/* Claim form would go here */}
          <Typography variant="body2" color="text.secondary">
            Claim form implementation will be added in a future update.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCloseClaimDialog}
          >
            Reject Claim
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCloseClaimDialog}
          >
            Approve Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoundItemsPage;
