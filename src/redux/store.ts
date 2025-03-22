import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authSlice';
import messageSlice from './reducer/messageSlice';
import notificationSlice from './reducer/notificationSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    message: messageSlice,
    Notification: notificationSlice
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;