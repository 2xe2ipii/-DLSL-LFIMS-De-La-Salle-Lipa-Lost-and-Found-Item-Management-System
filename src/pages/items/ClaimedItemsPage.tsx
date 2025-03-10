import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";
import { Item, ItemType } from "../../types/item";

// Mock data for claimed items
const generateMockClaimedItems = (): Item[] => {
  const types: ItemType[] = [
    "book",
    "electronics",
    "clothing",
    "accessory",
    "document",
    "other",
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `claimed-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    name: `Claimed Item ${i + 1}`,
    description: `Description for claimed item ${i + 1}`,
    color: ["Red", "Blue", "Black", "White", "Green"][
      Math.floor(Math.random() * 5)
    ],
    brand: ["Brand A", "Brand B", "Brand C"][Math.floor(Math.random() * 3)],
    dateReported: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
    status: "claimed",
    foundLocation: ["Canteen", "Library", "Gymnasium", "Classroom", "Hallway"][
      Math.floor(Math.random() * 5)
    ],
    foundBy: {
      id: `person-${i + 100}`,
      name: `Finder ${i + 1}`,
      type: ["student", "faculty", "staff", "visitor"][
        Math.floor(Math.random() * 4)
      ] as "student" | "faculty" | "staff" | "visitor",
    },
    foundDate: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
    claimedBy: {
      id: `claimer-${i + 1}`,
      name: `Claimer ${i + 1}`,
      type: "student",
      studentId: `ST${300000 + i}`,
      email: `student${i + 1}@dlsl.edu.ph`,
      phone: `09123456${i.toString().padStart(3, "0")}`,
    },
    claimDate: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ),
  }));
};

const mockClaimedItems = generateMockClaimedItems();

const ClaimedItemsPage: React.FC = () => {
  // In a real app, we would fetch this from the Redux store or API
  // const { items } = useAppSelector((state) => state.items);
  // const claimedItems = items.filter(item => item.status === 'claimed');
  const claimedItems = mockClaimedItems;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
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

  const handlePrintReceipt = () => {
    // Implement print functionality
    alert(
      "Print receipt functionality will be implemented in a future update."
    );
  };

  // Filter items based on search term and filter type
  const filteredItems = claimedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.claimedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.claimedBy?.studentId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType = filterType ? item.type === filterType : true;

    return matchesSearch && matchesType;
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Claimed Items
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
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Claimed By</TableCell>
              <TableCell>Claim Date</TableCell>
              <TableCell>Student/Employee ID</TableCell>
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
                  <TableCell>{item.claimedBy?.name || "Unknown"}</TableCell>
                  <TableCell>{formatDate(item.claimDate)}</TableCell>
                  <TableCell>
                    {item.claimedBy?.studentId ||
                      item.claimedBy?.employeeId ||
                      "N/A"}
                  </TableCell>
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
                      onClick={handlePrintReceipt}
                      title="Print Receipt"
                    >
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No claimed items found.
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
            <DialogTitle>Claimed Item Details</DialogTitle>
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
                <Chip label="Claimed" color="success" />
              </Box>

              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {viewItem.description}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Claim Date:</strong>{" "}
                    {formatDate(viewItem.claimDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Found Date:</strong>{" "}
                    {formatDate(viewItem.foundDate)}
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
                Claimer Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {viewItem.claimedBy?.name || "Unknown"}
                </Typography>
                {viewItem.claimedBy?.type && (
                  <Typography variant="body2">
                    <strong>Type:</strong>{" "}
                    {viewItem.claimedBy.type.charAt(0).toUpperCase() +
                      viewItem.claimedBy.type.slice(1)}
                  </Typography>
                )}
                {viewItem.claimedBy?.studentId && (
                  <Typography variant="body2">
                    <strong>Student ID:</strong> {viewItem.claimedBy.studentId}
                  </Typography>
                )}
                {viewItem.claimedBy?.employeeId && (
                  <Typography variant="body2">
                    <strong>Employee ID:</strong>{" "}
                    {viewItem.claimedBy.employeeId}
                  </Typography>
                )}
                {viewItem.claimedBy?.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {viewItem.claimedBy.email}
                  </Typography>
                )}
                {viewItem.claimedBy?.phone && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {viewItem.claimedBy.phone}
                  </Typography>
                )}
              </Paper>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Found By
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
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ClaimedItemsPage;
