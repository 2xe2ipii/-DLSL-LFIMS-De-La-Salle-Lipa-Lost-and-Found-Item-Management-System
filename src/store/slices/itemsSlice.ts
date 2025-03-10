import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item, ItemStatus } from '../../types/item';

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // Add a new item
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload);
    },
    // Update an existing item
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    // Change item status (lost, found, claimed, donated)
    changeItemStatus: (
      state,
      action: PayloadAction<{ id: string; status: ItemStatus }>
    ) => {
      const { id, status } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.status = status;
      }
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Delete an item (only for Super Admin)
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  addItem,
  updateItem,
  changeItemStatus,
  setLoading,
  setError,
  deleteItem,
} = itemsSlice.actions;

export default itemsSlice.reducer; 