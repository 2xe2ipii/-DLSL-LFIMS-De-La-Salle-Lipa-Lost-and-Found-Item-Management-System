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

    // Prepare the complete item object to submit
    const completeItem: Partial<Item> = {
      ...item,
      reportedBy: reporter.name ? reporter : undefined,
      // For found items, the person who reports it (reporter) is also considered the finder
      foundBy: formType === "found" && reporter.name ? reporter : undefined,
    };

    onSubmit(completeItem);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Item Details Section */}
        <Typography variant="h6" gutterBottom>
          Item Details
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            {initialData?.itemId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item ID"
                  name="itemId"
                  value={initialData.itemId}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="filled"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Item Name"
                name="name"
                value={item.name || ""}
                onChange={handleItemChange}
                placeholder="Enter a descriptive name for the item"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Item Type</InputLabel>
                <Select
                  name="type"
                  value={item.type || "book"}
                  label="Item Type"
                  onChange={handleSelectChange}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={item.color || ""}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={item.brand || ""}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date Reported"
                value={item.dateReported ? (typeof item.dateReported === 'string' ? new Date(item.dateReported) : item.dateReported) : null}
                onChange={handleDateReportedChange}
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Item Image
                </Typography>
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}
                
                {!previewImage && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="item-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                    <label htmlFor="item-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={isUploading ? <CircularProgress size={16} /> : <PhotoCamera />}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </label>
                  </>
                )}

                {previewImage && (
                  <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                    <img
                      src={previewImage}
                      alt="Item preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <IconButton
                      aria-label="delete image"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                      }}
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            {formType === "lost" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Seen Location"
                  name="location"
                  value={item.location || ""}
                  onChange={handleItemChange}
                  placeholder="Where was the item last seen?"
                />
              </Grid>
            )}
            {formType === "found" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Found Location"
                    name="foundLocation"
                    value={item.foundLocation || ""}
                    onChange={handleItemChange}
                    placeholder="Where was the item found?"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date Found"
                    value={item.foundDate ? (typeof item.foundDate === 'string' ? new Date(item.foundDate) : item.foundDate) : null}
                    onChange={handleFoundDateChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Storage Location"
                    name="storageLocation"
                    value={item.storageLocation || ""}
                    onChange={handleItemChange}
                    placeholder="Where is the item stored?"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>

        {/* Reporter Information Section */}
        <Typography variant="h6" gutterBottom>
          {formType === "lost" ? "Reporter Information" : "Reported By (Finder)"}
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={reporter.name || ""}
                onChange={handleReporterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={reporter.type || "student"}
                  label="Type"
                  onChange={handleReporterTypeChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="visitor">Visitor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {reporter.type === "student" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  name="studentId"
                  value={reporter.studentId || ""}
                  onChange={handleReporterChange}
                />
              </Grid>
            )}
            {(reporter.type === "faculty" || reporter.type === "staff") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={reporter.employeeId || ""}
                  onChange={handleReporterChange}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={reporter.email || ""}
                onChange={handleReporterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={reporter.phone || ""}
                onChange={handleReporterChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Notes Section */}
        <Typography variant="h6" gutterBottom>
          Additional Notes
        </Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            name="notes"
            value={item.notes || ""}
            onChange={handleItemChange}
            placeholder="Any additional information or special instructions"
          />
        </Paper>

        {/* Form Actions */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {formType === "lost" ? "Report Lost Item" : "Log Found Item"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ItemForm;
