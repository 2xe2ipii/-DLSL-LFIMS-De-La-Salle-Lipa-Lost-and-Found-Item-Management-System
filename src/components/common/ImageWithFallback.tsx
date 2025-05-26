import React, { useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ImageNotSupported as ImageNotSupportedIcon } from '@mui/icons-material';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  sx?: any;
  onLoad?: () => void;
  padding?: number;
  onClick?: () => void;
}

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
});

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = '100%',
  height = '100%',
  sx,
  onLoad,
  padding = 0,
  onClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If no src is provided, show placeholder immediately
  if (!src) {
    return (
      <Box
        sx={{
          width,
          height,
          position: 'relative',
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ccc',
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
        onClick={onClick}
      >
        <ImageNotSupportedIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
        <Typography variant="caption" color="textSecondary">
          No image available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      onClick={onClick}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      {!hasError && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <StyledImage
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{ 
              display: isLoading ? 'none' : 'block',
            }}
          />
        </Box>
      )}
      {hasError && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#666',
          }}
        >
          <ImageNotSupportedIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
          <Typography variant="caption" color="textSecondary">
            Failed to load image
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageWithFallback; 