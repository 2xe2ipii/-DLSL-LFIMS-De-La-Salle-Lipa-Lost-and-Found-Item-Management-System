import axios from 'axios';
import { Item } from '../types/item';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const itemService = {
  // Delete an item (soft delete)
  deleteItem: async (itemId: string) => {
    const response = await axios.put(`${API_URL}/items/${itemId}/delete`);
    return response;
  },

  // Restore a deleted item
  restoreItem: async (itemId: string) => {
    const response = await axios.put(`${API_URL}/items/${itemId}/restore`);
    return response;
  },

  // Update item information
  updateItem: async (itemId: string, itemData: Partial<Item>) => {
    const response = await axios.put(`${API_URL}/items/${itemId}`, itemData);
    return response;
  },
};

export default itemService; 