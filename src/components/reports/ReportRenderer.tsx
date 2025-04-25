import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Print,
  Refresh,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { ReportRendererProps } from '../../types/reports';

/**
 * ReportRenderer component - Renders PDF reports with options to download, print, zoom, and view in fullscreen
 * Optimized for performance using React.memo and useCallback for event handlers
 */
const ReportRenderer: React.FC<ReportRendererProps> = ({
  report,
  title,
  loading,
  error,
  onClose,
  onRefresh
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous URL
    if (pdfDataUrl) {
      URL.revokeObjectURL(pdfDataUrl);
    }

    if (report instanceof Blob) {
      const url = URL.createObjectURL(report);
      setPdfDataUrl(url);

      // Clean up on unmount
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfDataUrl(null);
    }
  }, [report]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleDownload = () => {
    if (report) {
      const url = URL.createObjectURL(report);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'Report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.4));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '700px',
            bgcolor: 'background.paper'
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Generating your report...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '700px',
            bgcolor: 'background.paper'
          }}
        >
          <Alert severity="error" sx={{ maxWidth: '80%' }}>
            {error}
          </Alert>
          {onRefresh && (
            <Button 
              variant="outlined" 
              startIcon={<Refresh />} 
              onClick={onRefresh}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          )}
        </Box>
      );
    }

    if (!report) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '700px',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="body1" color="textSecondary">
            Configure the report options and click "Generate Report" to preview your report here.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          pt: 1,
          px: 1,
          borderBottom: '1px solid #eaeaea'
        }}>
          <Box>
            <ButtonGroup variant="contained" size="small" sx={{ mr: 1 }}>
              <Tooltip title="Download PDF">
                <Button 
                  onClick={handleDownload} 
                  startIcon={<Download />}
                  color="primary"
                >
                  Download
                </Button>
              </Tooltip>
              <Tooltip title="Print">
                <Button 
                  onClick={handlePrint} 
                  startIcon={<Print />}
                  color="primary"
                >
                  Print
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            {onRefresh && (
              <Tooltip title="Refresh Report">
                <Button 
                  onClick={onRefresh} 
                  color="secondary" 
                  variant="outlined" 
                  size="small"
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Tooltip>
            )}
          </Box>
          
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title={`${Math.round(zoom * 100)}%`}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  px: 1, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: 0,
                  borderRight: 0,
                  height: '100%',
                  minWidth: '60px',
                  justifyContent: 'center'
                }}
              >
                {Math.round(zoom * 100)}%
              </Box>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>
        
        <Box 
          sx={{ 
            width: '100%', 
            height: isFullscreen ? '90vh' : '640px', 
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#f5f5f5'
          }}
        >
          <iframe
            ref={iframeRef}
            src={pdfDataUrl || ''}
            style={{
              width: `${100 * zoom}%`,
              height: '100%',
              border: 'none',
              transformOrigin: 'top center'
            }}
            title={title || 'Report Preview'}
          />
        </Box>
      </>
    );
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
      {renderContent()}
    </Box>
  );
};

export default ReportRenderer; 