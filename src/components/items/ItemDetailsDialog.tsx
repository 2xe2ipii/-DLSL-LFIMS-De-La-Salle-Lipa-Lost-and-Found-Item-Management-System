import React, { useState } from 'react';
import { Dialog, DialogContent, Grid, Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { format } from 'date-fns';
import ImageWithFallback from '../common/ImageWithFallback';
import { Item } from '../../types/item';
import { formatToSentenceCase } from '../../utils/formatters';

interface ItemDetailsDialogProps {
  item: Item;
  open: boolean;
  onClose: () => void;
}

const ItemDetailsDialog: React.FC<ItemDetailsDialogProps> = ({ item, open, onClose }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'PPP');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // 1:1 Aspect ratio
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                width="100%"
                height="100%"
                padding={32}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                onLoad={handleImageLoad}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Item Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Item ID"
                    secondary={item.itemId || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Name"
                    secondary={item.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={item.type || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Description"
                    secondary={item.description || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Location"
                    secondary={item.location || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date Lost"
                    secondary={formatDate(item.lostDate)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={formatToSentenceCase(item.status || 'N/A')}
                        color={item.status === 'found' ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog; 