import api from './api';

interface UploadResponse {
  success: boolean;
  imageUrl: string;
}

/**
 * Uploads an image file to the server
 * @param file The file to upload
 * @returns Promise with the image URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data as UploadResponse;
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Deletes an image from the server
 * @param imageUrl The URL of the image to delete
 * @returns Promise with the success status
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Handle different URL formats
    let filename;
    
    if (imageUrl.startsWith('/uploads/')) {
      // Remove the leading '/uploads/' part
      filename = imageUrl.substring('/uploads/'.length);
    } else if (imageUrl.includes('/uploads/')) {
      // Extract the part after '/uploads/'
      const parts = imageUrl.split('/uploads/');
      filename = parts[1];
    } else {
      // Just use the last part of the URL
      filename = imageUrl.split('/').pop();
    }
    
    if (!filename) {
      throw new Error('Invalid image URL');
    }

    await api.delete(`/uploads/image/${filename}`);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Formats an image URL to ensure it's correctly referenced
 * @param imageUrl The URL of the image
 * @returns Correctly formatted image URL
 */
export const formatImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '';
  
  // For debugging - log what we're trying to format
  console.log('Formatting image URL:', imageUrl);
  
  // Skip formatting if already a data URL
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a full URL (e.g., https://example.com/image.jpg), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it already starts with /api/uploads, return as is
  if (imageUrl.startsWith('/api/uploads/')) {
    return imageUrl;
  }
  
  // If it starts with /uploads/ but not /api/uploads/, add /api prefix
  if (imageUrl.startsWith('/uploads/')) {
    return `/api${imageUrl}`;
  }
  
  // Handle path formats with year/month structure (e.g., 2023/05/uuid.jpg)
  const slashCount = (imageUrl.match(/\//g) || []).length;
  if (slashCount >= 2 && /\d{4}\/\d{2}\//.test(imageUrl)) {
    return `/api/uploads/${imageUrl}`;
  }
  
  // Handle direct UUID filenames without path
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|gif)$/i;
  if (uuidPattern.test(imageUrl)) {
    // Try the new direct image endpoint that can search recursively
    return `/api/image/${imageUrl}`;
  }
  
  // Get just the filename regardless of path format
  const filename = imageUrl.split('/').pop() || imageUrl;
  
  // Use the direct image endpoint for better reliability
  return `/api/image/${filename}`;
};

// Create a named export object
const uploadService = {
  uploadImage,
  deleteImage,
  formatImageUrl,
};

export default uploadService; 