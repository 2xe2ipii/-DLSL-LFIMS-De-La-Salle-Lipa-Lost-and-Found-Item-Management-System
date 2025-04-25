import React, { useState, useEffect, useRef } from "react";
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
  Input,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { Item, ItemType, Person } from "../../types/item";
import { fetchItemsByStatus, clearError } from "../../store/slices/itemsSlice";
import { format } from "date-fns";
import uploadService from "../../services/uploadService";
import ImageWithFallback from "../../components/common/ImageWithFallback";

// Update the ExtendedItem interface to include all necessary properties
interface ExtendedItem extends Item {
  claimDate?: string | Date;
  claimedDate?: string | Date;
  claimant?: string;
  claimantId?: string;
  claimantEmail?: string;
  claimantPhone?: string;
  claimantType?: string;
  additionalData?: {
    claimant?: string;
    claimantId?: string;
    claimantEmail?: string;
    claimantPhone?: string;
    claimantType?: string;
    claimDate?: string | Date;
  };
}

// Type guard to check if an object is a Person
const isPersonObject = (obj: any): obj is Person => {
  return obj && typeof obj === 'object' && (
    'name' in obj || 
    'studentId' in obj || 
    'employeeId' in obj || 
    'email' in obj || 
    'phone' in obj
  );
};

// Enhanced function to get claimant information regardless of structure
const getClaimantInfo = (item: ExtendedItem) => {
  // Check if claimedBy is an object that matches Person structure
  if (item.claimedBy && isPersonObject(item.claimedBy)) {
    return {
      name: item.claimedBy.name || "N/A",
      type: item.claimedBy.type || "N/A",
      id: item.claimedBy.studentId || item.claimedBy.employeeId || "N/A",
      email: item.claimedBy.email || "N/A",
      phone: item.claimedBy.phone || "N/A"
    };
  }
  
  // Check if claimedBy is a string
  if (item.claimedBy && typeof item.claimedBy === 'string') {
    return {
      name: item.claimedBy,
      type: "N/A",
      id: "N/A",
      email: "N/A",
      phone: "N/A"
    };
  }
  
  // Check direct properties first
  if (item.claimant || item.claimantId || item.claimantEmail || item.claimantPhone) {
    return {
      name: item.claimant || "N/A",
      type: item.claimantType || "N/A",
      id: item.claimantId || "N/A",
      email: item.claimantEmail || "N/A",
      phone: item.claimantPhone || "N/A"
    };
  }
  
  // Check if claim information is stored in additionalData
  if (item.additionalData) {
    const { claimant, claimantId, claimantEmail, claimantPhone, claimantType } = item.additionalData;
    if (claimant || claimantId || claimantEmail || claimantPhone) {
      return {
        name: claimant || "N/A",
        type: claimantType || "N/A",
        id: claimantId || "N/A",
        email: claimantEmail || "N/A",
        phone: claimantPhone || "N/A"
      };
    }
  }
  
  // Default when no claimant info is found
  return {
    name: "N/A",
    type: "N/A",
    id: "N/A",
    email: "N/A",
    phone: "N/A"
  };
};

// Format date for display
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    // Handle both string and Date objects
    return format(typeof date === 'string' ? new Date(date) : date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const ClaimedItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.items);
  const printRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewItem, setViewItem] = useState<ExtendedItem | null>(null);

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

  const handleViewItem = (item: ExtendedItem) => {
    setViewItem(item);
  };

  const handleCloseViewDialog = () => {
    setViewItem(null);
  };

  const handlePrintReceipt = (item: ExtendedItem) => {
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) {
      alert("Please allow popups for this website");
      return;
    }

    const claimantInfo = getClaimantInfo(item);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Claim Receipt - ${item.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
          }
          .item-details, .claim-details {
            margin-bottom: 20px;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #ddd;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          h1 {
            font-size: 24px;
            color: #333;
          }
          h2 {
            font-size: 18px;
            color: #444;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #333;
            margin-top: 50px;
            text-align: center;
          }
          .property {
            font-weight: bold;
            color: #555;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12pt;
            }
            .no-print {
              display: none;
            }
            button {
              display: none;
            }
            .item-details, .claim-details {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>De La Salle Lipa - Lost & Found Claim Receipt</h1>
        </div>
        
        <div class="item-details">
          <h2>Item Details</h2>
          <p><span class="property">Item ID:</span> ${item.itemId || "N/A"}</p>
          <p><span class="property">Item Name:</span> ${item.name}</p>
          <p><span class="property">Type:</span> ${item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "N/A"}</p>
          <p><span class="property">Description:</span> ${item.description || "N/A"}</p>
          <p><span class="property">Color:</span> ${item.color || "N/A"}</p>
          <p><span class="property">Brand:</span> ${item.brand || "N/A"}</p>
          <p><span class="property">Date Found:</span> ${formatDate(item.foundDate)}</p>
          <p><span class="property">Found Location:</span> ${item.foundLocation || "N/A"}</p>
        </div>
        
        <div class="claim-details">
          <h2>Claim Information</h2>
          <p><span class="property">Claimed By:</span> ${claimantInfo.name}</p>
          <p><span class="property">Type:</span> ${claimantInfo.type ? claimantInfo.type.charAt(0).toUpperCase() + claimantInfo.type.slice(1) : "N/A"}</p>
          <p><span class="property">Student/Employee ID:</span> ${claimantInfo.id}</p>
          <p><span class="property">Email:</span> ${claimantInfo.email}</p>
          <p><span class="property">Phone:</span> ${claimantInfo.phone}</p>
          <p><span class="property">Date Claimed:</span> ${formatDate(item.claimedDate || item.claimDate || item.additionalData?.claimDate)}</p>
        </div>
        
        <div class="signature">
          <div>
            <div class="signature-line">
              Claimant's Signature
            </div>
          </div>
          <div>
            <div class="signature-line">
              Authorized by
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>De La Salle Lipa - Lost & Found Management System</p>
          <p>This receipt was generated on ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}</p>
          <button class="no-print" onclick="window.print()">Print Receipt</button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  // Filter items based on search term and filter type
  const filteredItems = items.filter((item) => {
    // Ensure we only display items with 'claimed' status
    if (item.status !== 'claimed') return false;
    
    const matchesSearch =
      (item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description ? item.description.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (isPersonObject(item.claimedBy) 
        ? (item.claimedBy.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) 
        : (typeof item.claimedBy === 'string' 
            ? item.claimedBy.toLowerCase().includes(searchTerm.toLowerCase()) 
            : false)) ||
      (isPersonObject(item.claimedBy) && item.claimedBy.studentId 
        ? item.claimedBy.studentId.toLowerCase().includes(searchTerm.toLowerCase()) 
        : false);

    const matchesType = filterType ? item.type === filterType : true;

    return matchesSearch && matchesType;
  });

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ).map(item => item as ExtendedItem);  // Cast items to ExtendedItem type

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Claimed Items
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
                <TableCell>Claimed By</TableCell>
                <TableCell>Date Claimed</TableCell>
                <TableCell>Student/Employee ID</TableCell>
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
                            cursor: 'pointer',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #eee'
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
                        label={
                          item.type.charAt(0).toUpperCase() + item.type.slice(1)
                        }
                        size="small"
                        color={
                          item.type === "electronics"
                            ? "primary"
                            : item.type === "book"
                            ? "secondary"
                            : item.type === "clothing"
                            ? "success"
                            : item.type === "accessory"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{getClaimantInfo(item).name}</TableCell>
                    <TableCell>
                      {item.claimedDate ? formatDate(item.claimedDate) : 
                       item.claimDate ? formatDate(item.claimDate) : 
                       item.additionalData?.claimDate ? formatDate(item.additionalData.claimDate) : "N/A"}
                    </TableCell>
                    <TableCell>{getClaimantInfo(item).id}</TableCell>
                    <TableCell>
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
                        onClick={() => handlePrintReceipt(item)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No claimed items found
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
            <DialogTitle>Claimed Item Details</DialogTitle>
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
                    {viewItem.type.charAt(0).toUpperCase() +
                      viewItem.type.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">
                    {viewItem.description}
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
                  <Typography variant="subtitle2">Date Reported</Typography>
                  <Typography variant="body1">
                    {viewItem.dateReported ? formatDate(viewItem.dateReported) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Found</Typography>
                  <Typography variant="body1">
                    {viewItem.foundDate ? formatDate(viewItem.foundDate) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Found Location</Typography>
                  <Typography variant="body1">
                    {viewItem.foundLocation || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Claimed</Typography>
                  <Typography variant="body1">
                    {viewItem.claimedDate ? formatDate(viewItem.claimedDate) : 
                     viewItem.claimDate ? formatDate(viewItem.claimDate) : 
                     viewItem.additionalData?.claimDate ? formatDate(viewItem.additionalData.claimDate) : "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1">
                    Claimant Information
                  </Typography>
                </Grid>
                
                {/* Display claimant information using the helper function */}
                {(() => {
                  const claimantInfo = getClaimantInfo(viewItem as ExtendedItem);
                  return (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Name</Typography>
                        <Typography variant="body1">
                          {claimantInfo.name}
                        </Typography>
                      </Grid>
                      {claimantInfo.type !== "N/A" && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Type</Typography>
                          <Typography variant="body1">
                            {claimantInfo.type.charAt(0).toUpperCase() + claimantInfo.type.slice(1)}
                          </Typography>
                        </Grid>
                      )}
                      {claimantInfo.id !== "N/A" && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">
                            {claimantInfo.type === 'student' ? 'Student ID' : 
                            claimantInfo.type === 'employee' ? 'Employee ID' : 'ID Number'}
                          </Typography>
                          <Typography variant="body1">
                            {claimantInfo.id}
                          </Typography>
                        </Grid>
                      )}
                      {claimantInfo.email !== "N/A" && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Email</Typography>
                          <Typography variant="body1">
                            {claimantInfo.email}
                          </Typography>
                        </Grid>
                      )}
                      {claimantInfo.phone !== "N/A" && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Phone</Typography>
                          <Typography variant="body1">
                            {claimantInfo.phone}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  );
                })()}

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
                onClick={() => handlePrintReceipt(viewItem)}
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
