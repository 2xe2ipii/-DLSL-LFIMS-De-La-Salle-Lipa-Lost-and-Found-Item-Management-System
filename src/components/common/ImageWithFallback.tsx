import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { ImageNotSupported as ImageNotSupportedIcon } from '@mui/icons-material';
import uploadService from '../../services/uploadService';

interface ImageWithFallbackProps {
  src: string | undefined;
  alt: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  sx?: any;
  onClick?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 50,
  height = 50,
  style,
  sx = {},
  onClick
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Function to generate alternative URLs based on the original URL
  const generateAlternativeUrls = (originalUrl: string): string[] => {
    const urls = [originalUrl];
    
    // If URL has /api/uploads/, try version without /api
    if (originalUrl.includes('/api/uploads/')) {
      urls.push(originalUrl.replace('/api/uploads/', '/uploads/'));
    }
    
    // If URL starts with /uploads/, try with /api prefix
    if (originalUrl.startsWith('/uploads/') && !originalUrl.startsWith('/api/uploads/')) {
      urls.push(`/api${originalUrl}`);
    }
    
    // For a URL with year/month pattern, try direct access
    const yearMonthPattern = /\/uploads\/(\d{4})\/(\d{2})\/([a-f0-9-]+\.(jpg|jpeg|png|gif))/i;
    const match = originalUrl.match(yearMonthPattern);
    if (match) {
      const filename = match[3];
      urls.push(`/uploads/${filename}`);
      urls.push(`/api/uploads/${filename}`);
    }
    
    // For a direct filename, try with year/month if we can detect it
    const uuidPattern = /^\/uploads\/([a-f0-9-]+\.(jpg|jpeg|png|gif))$/i;
    const filenameMatch = originalUrl.match(uuidPattern);
    if (filenameMatch) {
      // Current date might not match the actual upload date, but it's worth a try
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      urls.push(`/uploads/${year}/${month}/${filenameMatch[1]}`);
      urls.push(`/api/uploads/${year}/${month}/${filenameMatch[1]}`);
    }
    
    return urls;
  };
  
  useEffect(() => {
    if (src) {
      setHasError(false);
      setIsLoading(true);
      setAttemptCount(0);
      
      // Use the uploadService to format the URL consistently
      const formattedUrl = uploadService.formatImageUrl(src);
      console.log('Original src:', src);
      console.log('Formatted URL:', formattedUrl);
      
      // Generate alternative URLs that we'll try if the primary one fails
      const alternativeUrls = generateAlternativeUrls(formattedUrl);
      console.log('Will try these URLs in order:', alternativeUrls);
      
      setImageUrl(formattedUrl);
    }
  }, [src]);
  
  // If no src or there was an error with all attempts, show fallback
  if (!src || (hasError && attemptCount > 0 && !fallbackUrl)) {
    return (
      <Box
        sx={{
          width,
          height,
          bgcolor: 'grey.200',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ddd',
          ...sx
        }}
        onClick={onClick}
      >
        <ImageNotSupportedIcon color="disabled" />
        {hasError && (
          <Typography variant="caption" sx={{ mt: 1, fontSize: '8px', textAlign: 'center' }}>
            Failed to load image
          </Typography>
        )}
      </Box>
    );
  }
  
  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    
    // Try alternative URL formats if the original fails
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    
    // Generate alternative URLs
    const alternativeUrls = generateAlternativeUrls(uploadService.formatImageUrl(src || ''));
    
    if (nextAttempt < alternativeUrls.length) {
      console.log(`Attempt ${nextAttempt + 1}: Trying alternative URL:`, alternativeUrls[nextAttempt]);
      setImageUrl(alternativeUrls[nextAttempt]);
    } else {
      // Last resort, try a direct URL to the filename without path structure
      const filename = src?.split('/').pop();
      if (filename && !fallbackUrl) {
        const directUrl = `/api/uploads/${filename}`;
        console.log('Last resort: Trying direct URL:', directUrl);
        setFallbackUrl(directUrl);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    }
  };
  
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setIsLoading(false);
  };
  
  // If we have a fallback URL, use it
  const currentUrl = fallbackUrl || imageUrl;
  
  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: '4px',
        overflow: 'hidden',
        ...sx
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              width: '30%',
              height: '30%',
              borderRadius: '50%',
              border: '2px solid #ddd',
              borderTop: '2px solid #006400',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
      )}
      <img
        src={currentUrl}
        alt={alt}
        width={width}
        height={height}
        style={{
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          cursor: onClick ? 'pointer' : 'default',
          ...style
        }}
        onClick={onClick}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </Box>
  );
};

export default ImageWithFallback; 