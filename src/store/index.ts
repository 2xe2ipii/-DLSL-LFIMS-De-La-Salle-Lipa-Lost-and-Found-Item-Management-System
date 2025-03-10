import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from './slices/itemsSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    items: itemsReducer,
    auth: authReducer,
    // Add more reducers here as needed
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 