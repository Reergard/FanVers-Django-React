import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import notificationReducer from './notification/notificationSlice';
import userSettingsReducer from './settings/userSettingsSlice';
import chatReducer from './chat/chatSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        userSettings: userSettingsReducer,
        chat: chatReducer,
    },
});

export default store;
