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
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
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
            return thunkAPI.rejectWithValue(error.message);
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
                const uniqueNotifications = [...new Map(
                    action.payload.map(item => [item.id, item])
                ).values()];
                state.notifications = uniqueNotifications;
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification) {
                    notification.is_read = true;
                }
            });
    }
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;