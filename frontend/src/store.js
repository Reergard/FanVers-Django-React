import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import notificationReducer from './notification/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
    },
});

export default store;