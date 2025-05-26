import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Divider,
  SelectChangeEvent,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Item, ItemType, Person } from "../../types/item";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import uploadService from "../../services/uploadService";

interface ItemFormProps {
  formType: "lost" | "found";
  onSubmit: (item: Partial<Item>) => void;
  onCancel: () => void;
  initialData?: Partial<Item>;
}

// Type guard to check if an object is a Person
const isPersonObject = (obj: any): obj is Person => {
  return obj && typeof obj === 'object' && 'name' in obj;
};

const ItemForm: React.FC<ItemFormProps> = ({
  formType,
  onSubmit,
  onCancel,
  initialData,
}) => {
  // Parse reportedBy from initialData safely
  const reporterFromInitialData = (): Person => {
    if (initialData?.reportedBy) {
      if (isPersonObject(initialData.reportedBy)) {
        return {
          name: initialData.reportedBy.name || "",
          type: initialData.reportedBy.type || "student",
          studentId: initialData.reportedBy.studentId,
          employeeId: initialData.reportedBy.employeeId,
          email: initialData.reportedBy.email,
          phone: initialData.reportedBy.phone
        };
      }
    }
    return {
      name: "",
      type: "student",
      studentId: undefined,
      employeeId: undefined,
      email: undefined,
      phone: undefined
    };
  };

  const [item, setItem] = useState<
    Omit<Partial<Item>, "reportedBy" | "foundBy">
  >(
    initialData
      ? {
          type: initialData.type || "book",
          name: initialData.name || "",
          description: initialData.description || "",
          color: initialData.color,
          brand: initialData.brand,
          dateReported: initialData.dateReported || new Date(),
          status: initialData.status || formType,
          location: initialData.location,
          foundLocation: initialData.foundLocation,
          storageLocation: initialData.storageLocation,
          foundDate: initialData.foundDate,
          notes: initialData.notes,
          imageUrl: initialData.imageUrl,
          itemId: initialData.itemId,
        }
      : {
          type: "book",
          name: "",
          description: "",
          color: "",
          brand: "",
          dateReported: new Date(),
          status: formType,
          location: "",
          foundLocation: "",
          storageLocation: "",
          foundDate: formType === "found" ? new Date() : undefined,
          imageUrl: "",
        }
  );

  const [reporter, setReporter] = useState<Person>(reporterFromInitialData());

  // Image state
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add states for image upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Update useEffect for image preview
  useEffect(() => {
    if (initialData?.imageUrl) {
      setPreviewImage(uploadService.formatImageUrl(initialData.imageUrl));
      setItem(prev => ({ ...prev, imageUrl: initialData.imageUrl }));
    }
  }, [initialData]);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleReporterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReporter({ ...reporter, [name]: value });
  };

  const handleReporterTypeChange = (e: SelectChangeEvent<string>) => {
    setReporter({
      ...reporter,
      type: e.target.value as "student" | "faculty" | "staff" | "visitor",
    });
  };

  const handleDateReportedChange = (date: Date | null) => {
    if (date) {
      setItem({ ...item, dateReported: date });
    }
  };

  const handleFoundDateChange = (date: Date | null) => {
    if (date) {
      setItem({ ...item, foundDate: date });
    }
  };

  // Update the image upload handler to use the upload service
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        const imageUrl = await uploadService.uploadImage(file);
        setItem({ ...item, imageUrl });
        setIsUploading(false);
      } catch (error) {
        setUploadError("Error uploading image. Please try again.");
        setIsUploading(false);
      }
    }
  };

  // Update the remove image handler to use the upload service
  const handleRemoveImage = async () => {
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      try {
        await uploadService.deleteImage(item.imageUrl);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setPreviewImage(null);
    setItem({ ...item, imageUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!item.name || !item.type || !item.description || !item.location) {
      setUploadError("Please fill in all required fields");
      return;
    }

    // Validate reporter information
    if (!reporter.name || !reporter.email || !reporter.phone) {
      setUploadError("Please provide your contact information");
      return;
    }

    // Map the form type to the correct status
    const status = formType === 'lost' ? 'missing' : 'in_custody';

    // Prepare the complete item object to submit
    const completeItem: Partial<Item> = {
      ...item,
      reportedBy: reporter,
      status: status,
      dateReported: new Date(),
      lostDate: formType === 'lost' ? item.lostDate || new Date() : undefined,
      foundDate: formType === 'found' ? item.foundDate || new Date() : undefined,
      foundLocation: formType === 'found' ? item.foundLocation : undefined,
      storageLocation: formType === 'found' ? item.storageLocation : undefined,
      location: formType === 'lost' ? item.location : undefined,
      type: item.type || 'other', // Ensure type is always set
      description: item.description || '', // Ensure description is always set
      name: item.name || '', // Ensure name is always set
    };

    console.log('Submitting item with data:', completeItem); // Debug log
    onSubmit(completeItem);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}

        {/* Item Details Section */}
        <Typography variant="h6" gutterBottom>
          Item Details
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Item Name"
                name="name"
                value={item.name || ""}
                onChange={handleItemChange}
                placeholder="Enter a descriptive name for the item"
                error={!item.name}
                helperText={!item.name ? "Item name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!item.type}>
                <InputLabel>Item Type</InputLabel>
                <Select
                  name="type"
                  value={item.type || ""}
                  onChange={handleSelectChange}
                  label="Item Type"
                >
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
                {!item.type && <Typography color="error" variant="caption">Item type is required</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Description"
                name="description"
                value={item.description || ""}
                onChange={handleItemChange}
                placeholder="Provide a detailed description of the item"
                error={!item.description}
                helperText={!item.description ? "Description is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={item.color || ""}
                onChange={handleItemChange}
                placeholder="Item color"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={item.brand || ""}
                onChange={handleItemChange}
                placeholder="Item brand"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Lost Location"
                name="location"
                value={item.location || ""}
                onChange={handleItemChange}
                placeholder="Where did you lose the item?"
                error={!item.location}
                helperText={!item.location ? "Location is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date Lost"
                value={item.lostDate ? new Date(item.lostDate) : null}
                onChange={(date) => setItem({ ...item, lostDate: date || undefined })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !item.lostDate,
                    helperText: !item.lostDate ? "Date lost is required" : ""
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Item Image
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {previewImage ? (
                    <Box sx={{ position: "relative", width: "100%", maxWidth: 300 }}>
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                      />
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Reporter Information Section */}
        <Typography variant="h6" gutterBottom>
          Your Information
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Your Name"
                name="name"
                value={reporter.name || ""}
                onChange={handleReporterChange}
                error={!reporter.name}
                helperText={!reporter.name ? "Name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!reporter.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={reporter.type}
                  label="Type"
                  onChange={handleReporterTypeChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="visitor">Visitor</MenuItem>
                </Select>
                {!reporter.type && <Typography color="error" variant="caption">Type is required</Typography>}
              </FormControl>
            </Grid>
            {reporter.type === "student" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Student ID"
                  name="studentId"
                  value={reporter.studentId || ""}
                  onChange={handleReporterChange}
                  error={!reporter.studentId}
                  helperText={!reporter.studentId ? "Student ID is required" : ""}
                />
              </Grid>
            )}
            {(reporter.type === "faculty" || reporter.type === "staff") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Employee ID"
                  name="employeeId"
                  value={reporter.employeeId || ""}
                  onChange={handleReporterChange}
                  error={!reporter.employeeId}
                  helperText={!reporter.employeeId ? "Employee ID is required" : ""}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={reporter.email || ""}
                onChange={handleReporterChange}
                error={!reporter.email}
                helperText={!reporter.email ? "Email is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="phone"
                value={reporter.phone || ""}
                onChange={handleReporterChange}
                error={!reporter.phone}
                helperText={!reporter.phone ? "Phone is required" : ""}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Form Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUploading}
          >
            {isUploading ? "Submitting..." : "Report Lost Item"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ItemForm;
