import React, { useState } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Item, ItemType, Person } from "../../types/item";

interface ItemFormProps {
  formType: "lost" | "found";
  onSubmit: (item: Partial<Item>) => void;
  onCancel: () => void;
  initialData?: Partial<Item>;
}

const ItemForm: React.FC<ItemFormProps> = ({
  formType,
  onSubmit,
  onCancel,
  initialData,
}) => {
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
        }
  );

  const [reporter, setReporter] = useState<Person>({
    name: initialData?.reportedBy?.name || "",
    type: initialData?.reportedBy?.type || "student",
    studentId: initialData?.reportedBy?.studentId,
    employeeId: initialData?.reportedBy?.employeeId,
    email: initialData?.reportedBy?.email,
    phone: initialData?.reportedBy?.phone,
  });

  const [finder, setFinder] = useState<Person>({
    name: initialData?.foundBy?.name || "",
    type: initialData?.foundBy?.type || "student",
    studentId: initialData?.foundBy?.studentId,
    employeeId: initialData?.foundBy?.employeeId,
    email: initialData?.foundBy?.email,
    phone: initialData?.foundBy?.phone,
  });

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

  const handleFinderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFinder({ ...finder, [name]: value });
  };

  const handleFinderTypeChange = (e: SelectChangeEvent<string>) => {
    setFinder({
      ...finder,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the complete item object to submit
    const completeItem: Partial<Item> = {
      ...item,
      reportedBy: reporter.name ? reporter : undefined,
      foundBy: formType === "found" && finder.name ? finder : undefined,
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Item Name"
                name="name"
                value={item.name || ""}
                onChange={handleItemChange}
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
                value={item.dateReported || null}
                onChange={handleDateReportedChange}
              />
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
                    value={item.foundDate || null}
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
          {formType === "lost" ? "Reporter Information" : "Reported By"}
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

        {/* Finder Information Section (Only for Found Items) */}
        {formType === "found" && (
          <>
            <Typography variant="h6" gutterBottom>
              Found By
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Name"
                    name="name"
                    value={finder.name || ""}
                    onChange={handleFinderChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={finder.type || "student"}
                      label="Type"
                      onChange={handleFinderTypeChange}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="faculty">Faculty</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="visitor">Visitor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {finder.type === "student" && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Student ID"
                      name="studentId"
                      value={finder.studentId || ""}
                      onChange={handleFinderChange}
                    />
                  </Grid>
                )}
                {(finder.type === "faculty" || finder.type === "staff") && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employeeId"
                      value={finder.employeeId || ""}
                      onChange={handleFinderChange}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={finder.email || ""}
                    onChange={handleFinderChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={finder.phone || ""}
                    onChange={handleFinderChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

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
