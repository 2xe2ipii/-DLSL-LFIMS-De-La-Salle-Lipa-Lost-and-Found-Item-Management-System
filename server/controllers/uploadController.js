const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to ensure subdirectories exist
const ensureSubDir = () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const yearDir = path.join(uploadsDir, year);
  const monthDir = path.join(yearDir, month);
  
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  
  if (!fs.existsSync(monthDir)) {
    fs.mkdirSync(monthDir, { recursive: true });
  }
  
  return { year, month };
};

// Image upload handler
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageFile = req.files.image;
    const fileExtension = path.extname(imageFile.name).toLowerCase();
    
    // Validate file type
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed' 
      });
    }
    
    // Create year/month directories
    const { year, month } = ensureSubDir();
    
    // Generate unique filename
    const fileName = `${uuidv4()}${fileExtension}`;
    const relativePath = path.join(year, month, fileName);
    const uploadPath = path.join(uploadsDir, relativePath);
    
    // Save the file
    await imageFile.mv(uploadPath);
    
    // Return the file URL - use forward slashes for web URLs
    const fileUrl = `/uploads/${year}/${month}/${fileName}`;
    
    res.json({ 
      success: true, 
      imageUrl: fileUrl 
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};

// Delete uploaded image
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    let filePath;
    
    // Handle both direct filenames and paths
    if (filename.includes('/')) {
      // This is a path like '2023/01/abc123.jpg'
      // Security check to prevent directory traversal
      if (filename.includes('..')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }
      filePath = path.join(uploadsDir, filename);
    } else {
      // Just a filename
      filePath = path.join(uploadsDir, filename);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.json({ success: true, message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'File deletion failed' });
  }
}; 