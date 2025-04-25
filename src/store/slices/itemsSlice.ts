import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Item, ItemStatus } from '../../types/item';
import api from '../../services/api';
import matchingService from '../../services/matchingService';
import { AppDispatch, RootState } from '../index';

// Define AppThunk type
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<ReturnType>;

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  stats: any | null;
  matches: Record<string, Array<{item: Item, score: number}>>;
  donationItems: Item[];
}

// Async thunks
export const fetchAllItems = createAsyncThunk(
  'items/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/items');
      return response.data as Item[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch items');
    }
  }
);

export const fetchItemsByStatus = createAsyncThunk(
  'items/fetchByStatus',
  async (status: ItemStatus, { rejectWithValue }) => {
    try {
      const response = await api.get(`/items/status/${status}`);
      return response.data as Item[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || `Failed to fetch ${status} items`);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'items/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/items/stats/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const addNewItem = createAsyncThunk(
  'items/add',
  async (item: Partial<Item>, { rejectWithValue }) => {
    try {
      const response = await api.post('/items', item);
      return response.data as Item;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item');
    }
  }
);

export const updateExistingItem = createAsyncThunk(
  'items/update',
  async (item: Item, { rejectWithValue }) => {
    try {
      const response = await api.put(`/items/${item.id}`, item);
      return response.data as Item;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const changeItemStatusAPI = createAsyncThunk(
  'items/changeStatus',
  async (
    { id, status, additionalData, claimedBy }: 
    { id: string; status: ItemStatus; additionalData?: any; claimedBy?: any },
    { rejectWithValue }
  ) => {
    try {
      // Prepare the request data - handle both claimedBy directly or in additionalData
      const requestData: any = { status };
      
      // If claimedBy is provided directly, add it to the request
      if (claimedBy) {
        requestData.claimedBy = claimedBy;
      }
      
      // Add any other additional data
      if (additionalData) {
        // If additionalData contains claimedBy, extract it to the top level
        if (additionalData.claimedBy) {
          requestData.claimedBy = additionalData.claimedBy;
          // Create a copy without claimedBy for other fields
          const { claimedBy: _, ...otherData } = additionalData;
          requestData.additionalData = otherData;
        } else {
          requestData.additionalData = additionalData;
        }
      }
      
      console.log('Sending status change request:', { id, requestData }); // Debug log
      const response = await api.patch(`/items/${id}/status`, requestData);
      console.log('Status change response:', response.data); // Debug log
      return response.data as Item;
    } catch (error: any) {
      console.error('Status change error:', error.response?.data || error); // Debug log
      return rejectWithValue(error.response?.data?.message || 'Failed to change item status');
    }
  }
);

export const deleteItemAPI = createAsyncThunk(
  'items/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/items/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

// New thunk to check and mark items for donation
export const checkAndMarkForDonation = createAsyncThunk(
  'items/checkDonation',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { items: ItemsState };
      const foundItems = state.items.items.filter(item => item.status === 'found');
      
      // Check items that should be donated based on 3-month rule
      const itemsForDonation = matchingService.getItemsEligibleForDonation(foundItems);
      
      // Update each item's status to 'donated'
      const promises = itemsForDonation.map(item => 
        dispatch(changeItemStatusAPI({
          id: item.id || item._id || '',
          status: 'donated',
          additionalData: { notes: `Automatically marked for donation after 3 months on ${new Date().toISOString()}` }
        })).unwrap()
      );
      
      await Promise.all(promises);
      
      return itemsForDonation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check items for donation');
    }
  }
);

// New thunk to find potential matches between lost and found items
export const findPotentialMatches = createAsyncThunk(
  'items/findMatches',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { items: ItemsState };
      const lostItems = state.items.items.filter(item => item.status === 'lost');
      const foundItems = state.items.items.filter(item => item.status === 'found');
      
      // Find potential matches
      const matches = matchingService.findAllMatches(lostItems, foundItems);
      
      return matches;
    } catch (error: any) {
      return rejectWithValue('Failed to find potential matches');
    }
  }
);

// New thunk to mark a single item for donation by id
export const markItemForDonation = createAsyncThunk(
  'items/markForDonation',
  async (itemId: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(changeItemStatusAPI({
        id: itemId,
        status: 'donated',
        additionalData: { notes: `Manually marked for donation on ${new Date().toISOString()}` }
      })).unwrap();
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark item for donation');
    }
  }
);

/**
 * Function to process items for donation
 */
export const processItemsForDonation = (): AppThunk<{success: boolean, count: number, error?: string}> => 
  async (dispatch, getState) => {
    try {
      // Get eligible items from the state
      const state = getState();
      const items = state.items.items;
      
      // Use matching service to identify items eligible for donation
      const itemsForDonation = matchingService.getItemsEligibleForDonation(items);
      
      if (itemsForDonation.length > 0) {
        const promises = itemsForDonation.map(item => 
          dispatch(changeItemStatusAPI({
            id: item.id || item._id || '', // Handle possible undefined id
            status: 'donated',
            additionalData: { notes: `Automatically marked for donation after 3 months on ${new Date().toISOString()}` }
          })).unwrap()
        );
        
        await Promise.all(promises);
        return { success: true, count: itemsForDonation.length };
      }
      
      return { success: true, count: 0 };
    } catch (error) {
      console.error('Error processing items for donation:', error);
      return { success: false, count: 0, error: (error as Error).message };
    }
  };

const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
  stats: null,
  matches: {},
  donationItems: []
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMatches: (state) => {
      state.matches = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Items
      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Items By Status
      .addCase(fetchItemsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItemsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add New Item
      .addCase(addNewItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addNewItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Item
      .addCase(updateExistingItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateExistingItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change Item Status
      .addCase(changeItemStatusAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeItemStatusAPI.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(changeItemStatusAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Item
      .addCase(deleteItemAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteItemAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Finding potential matches
      .addCase(findPotentialMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findPotentialMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(findPotentialMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check and mark for donation
      .addCase(checkAndMarkForDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAndMarkForDonation.fulfilled, (state, action) => {
        state.loading = false;
        state.donationItems = action.payload;
      })
      .addCase(checkAndMarkForDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark item for donation
      .addCase(markItemForDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markItemForDonation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(markItemForDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMatches } = itemsSlice.actions;

export default itemsSlice.reducer; 