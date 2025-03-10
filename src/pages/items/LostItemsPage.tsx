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
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";
import ItemForm from "../../components/items/ItemForm";

// Mock data for lost items
const generateMockLostItems = (): Item[] => {
  const types: ItemType[] = [
    "book",
    "electronics",
    "clothing",
    "accessory",
    "document",
    "other",
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `lost-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    color: ["Red", "Blue", "Black", "White", "Green"][
      Math.floor(Math.random() * 5)
    ],
    brand: ["Brand A", "Brand B", "Brand C"][Math.floor(Math.random() * 3)],
    dateReported: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
    status: "lost",
    location: ["Canteen", "Library", "Gymnasium", "Classroom", "Hallway"][
      Math.floor(Math.random() * 5)
    ],
    reportedBy: {
      id: `person-${i + 1}`,
      name: `Person ${i + 1}`,
      type: ["student", "faculty", "staff", "visitor"][
        Math.floor(Math.random() * 4)
      ] as "student" | "faculty" | "staff" | "visitor",
      studentId: `ST${100000 + i}`,
    },
  }));
};

const mockLostItems = generateMockLostItems();

const LostItemsPage: React.FC = () => {
  // In a real app, we would fetch this from the Redux store or API
  // const { items } = useAppSelector((state) => state.items);
  // const lostItems = items.filter(item => item.status === 'lost');
  const lostItems = mockLostItems;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);

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
    alert("New lost item submitted: " + JSON.stringify(newItem));
    handleCloseAddDialog();
  };

  // Filter items based on search term and filter type
  const filteredItems = lostItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reportedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

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
        Lost Items
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
              Report Lost Item
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
              <TableCell>Date Reported</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Reported By</TableCell>
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
                  <TableCell>{formatDate(item.dateReported)}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.reportedBy?.name}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No lost items found.
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
                <Chip label="Lost" color="error" />
              </Box>

              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {viewItem.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date Reported:</strong>{" "}
                    {formatDate(viewItem.dateReported)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Location:</strong> {viewItem.location}
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
                Reporter Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {viewItem.reportedBy?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong>{" "}
                  {viewItem.reportedBy?.type
                    ? viewItem.reportedBy.type.charAt(0).toUpperCase() +
                      viewItem.reportedBy.type.slice(1)
                    : "N/A"}
                </Typography>
                {viewItem.reportedBy?.studentId && (
                  <Typography variant="body2">
                    <strong>Student ID:</strong> {viewItem.reportedBy.studentId}
                  </Typography>
                )}
                {viewItem.reportedBy?.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {viewItem.reportedBy.email}
                  </Typography>
                )}
                {viewItem.reportedBy?.phone && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {viewItem.reportedBy.phone}
                  </Typography>
                )}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button variant="contained" color="primary">
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add New Lost Item Dialog */}
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
            onSubmit={handleSubmitItem}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LostItemsPage;
