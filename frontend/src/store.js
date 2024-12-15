import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import notificationReducer from './notification/notificationSlice';
import userSettingsReducer from './settings/userSettingsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        userSettings: userSettingsReducer,
    },
});

export default store;