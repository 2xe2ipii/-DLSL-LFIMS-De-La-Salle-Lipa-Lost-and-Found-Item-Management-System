import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  useTheme,
  alpha,
  CardMedia,
  CardActionArea,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  AssignmentReturn as ClaimIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Item } from '../../types/item';
import ImageWithFallback from '../common/ImageWithFallback';
import { formatToSentenceCase } from '../../utils/formatters';

interface MobileItemListProps {
  items: Item[];
  onViewItem: (item: Item) => void;
  onEditItem?: (item: Item) => void;
  onClaimItem?: (item: Item) => void;
  onInquireItem?: (item: Item) => void;
  onPrintCertificate?: (item: Item) => void;
  isAdmin?: boolean;
  showImage?: boolean;
  showClaimButton?: boolean;
  showInquireButton?: boolean;
  showPrintButton?: boolean;
}

const MobileItemList: React.FC<MobileItemListProps> = ({
  items,
  onViewItem,
  onEditItem,
  onClaimItem,
  onInquireItem,
  onPrintCertificate,
  isAdmin = false,
  showImage = false,
  showClaimButton = false,
  showInquireButton = false,
  showPrintButton = false,
}) => {
  const theme = useTheme();

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <Grid container spacing={2} sx={{ p: 1 }}>
      {items.map((item) => (
        <Grid item xs={6} key={item.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardActionArea onClick={() => onViewItem(item)}>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%', // 1:1 Aspect ratio
                  width: '100%',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px 8px 0 0',
                  overflow: 'hidden',
                }}
              >
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  padding={16}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Typography 
                  variant="subtitle1" 
                  noWrap 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    mb: 0.5
                  }}
                >
                  {item.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.75rem'
                  }}
                >
                  ID: {item.itemId}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "N/A"}
                    size="small"
                    sx={{ 
                      height: '20px',
                      fontSize: '0.7rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Chip
                    label={formatToSentenceCase(item.status)}
                    color={
                      item.status === "lost"
                        ? "error"
                        : item.status === "found"
                        ? "info"
                        : item.status === "claimed"
                        ? "success"
                        : "default"
                    }
                    size="small"
                    sx={{ 
                      height: '20px',
                      fontSize: '0.7rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Box>

                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    fontSize: '0.75rem',
                    mb: 0.5
                  }}
                >
                  {item.location || item.foundLocation || "N/A"}
                </Typography>

                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  {item.lostDate
                    ? formatDate(item.lostDate)
                    : item.foundDate
                    ? formatDate(item.foundDate)
                    : "N/A"}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    mt: 1,
                    justifyContent: 'center',
                  }}
                >
                  {isAdmin && onEditItem && (
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItem(item);
                      }}
                      sx={{
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                        },
                        width: 28,
                        height: 28,
                      }}
                    >
                      <EditIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}

                  {showClaimButton && onClaimItem && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClaimItem(item);
                      }}
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.2),
                        },
                        width: 28,
                        height: 28,
                      }}
                    >
                      <ClaimIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}

                  {showInquireButton && onInquireItem && (
                    <Button
                      size="small"
                      color="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInquireItem(item);
                      }}
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.2),
                        },
                        minWidth: '80px',
                        height: 28,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                      }}
                    >
                      Inquire
                    </Button>
                  )}

                  {showPrintButton && onPrintCertificate && (
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintCertificate(item);
                      }}
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.2),
                        },
                        width: 28,
                        height: 28,
                      }}
                    >
                      <PrintIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MobileItemList; 