import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../api';

const initialState = {
    notifications: [],
    loading: false,
    error: null
};

export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (_, thunkAPI) => {
        try {
            const response = await notificationAPI.getNotifications();
            
            // Проверяем, что response существует и содержит data
            if (!response || !response.data) {
                console.warn('Invalid response from API:', response);
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error('Error in fetchNotifications thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка завантаження повідомлень');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notification/markAsRead',
    async (notificationId, thunkAPI) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            console.error('Error in markNotificationAsRead thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка при позначенні повідомлення');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notification/deleteNotification',
    async (notificationId, thunkAPI) => {
        try {
            await notificationAPI.deleteNotification(notificationId);
            return notificationId;
        } catch (error) {
            console.error('Error in deleteNotification thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка при видаленні повідомлення');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                // Проверяем, что action.payload существует и является массивом
                if (Array.isArray(action.payload)) {
                    const uniqueNotifications = [...new Map(
                        action.payload.map(item => [item.id, item])
                    ).values()];
                    state.notifications = uniqueNotifications;
                } else {
                    console.warn('Invalid payload in fetchNotifications.fulfilled:', action.payload);
                    state.notifications = [];
                }
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Помилка завантаження повідомлень';
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification) {
                    notification.is_read = true;
                }
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.notifications = state.notifications.filter(
                    n => n.id !== action.payload
                );
            });
    }
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;