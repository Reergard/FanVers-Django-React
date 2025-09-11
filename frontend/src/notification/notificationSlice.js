import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../api';

const initialState = {
    notifications: [],
    loading: false,
    error: null,
    lastVersion: null
};

export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (_, thunkAPI) => {
        try {
            const { lastVersion } = thunkAPI.getState().notification;
            const response = await notificationAPI.getNotifications(lastVersion);
            
            // Проверяем, что response существует и содержит data
            if (!response || !response.data) {
                console.warn('Invalid response from API:', response);
                return { data: [], changed: false };
            }
            
            // Проверяем, что data является массивом
            if (!Array.isArray(response.data)) {
                console.warn('Invalid data format from API:', response.data);
                return { data: [], changed: false };
            }
            
            // Дополнительная проверка на валидность элементов массива
            const validNotifications = response.data.filter(item => 
                item && typeof item === 'object' && item.id
            );
            
            return { 
                data: validNotifications, 
                changed: !!response.changed,
                version: response.version
            };
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
                const { data = [], changed = false, version } = action.payload || {};
                
                // Проверяем, что data существует и является массивом
                if (Array.isArray(data)) {
                    // Дополнительная проверка на валидность элементов массива
                    const validNotifications = data.filter(item => 
                        item && typeof item === 'object' && item.id
                    );
                    
                    const uniqueNotifications = [...new Map(
                        validNotifications.map(item => [item.id, item])
                    ).values()];
                    
                    // Определяем, это старый формат (без версии) или новый
                    const isOldFormat = version == null || version === '0';
                    
                    if (isOldFormat) {
                        // Старый формат — версий нет, доверяем данным целиком
                        state.notifications = uniqueNotifications;  // обновляем даже если []
                        state.lastVersion = version ?? '0';
                        console.log(`📬 [Notifications] (old format) state overwritten, count: ${uniqueNotifications.length}`);
                    } else if (changed || state.notifications.length === 0) {
                        // Новый формат — обновляем только при изменениях
                        state.notifications = uniqueNotifications;
                        state.lastVersion = version;
                        console.log(`📬 [Notifications] updated (changed: ${changed}, v:${version})`);
                    } else {
                        console.log(`📬 [Notifications] skipped (unchanged, v:${version})`);
                    }
                    
                    // Логируем количество уведомлений из БД
                    console.log(`📬 [Notifications] Загружено уведомлений из БД: ${uniqueNotifications.length}`);
                    console.log(`📬 [Notifications] Непрочитанных: ${uniqueNotifications.filter(n => !n.is_read).length}`);
                    console.log(`📬 [Notifications] Прочитанных: ${uniqueNotifications.filter(n => n.is_read).length}`);
                } else {
                    console.warn('Invalid payload in fetchNotifications.fulfilled:', action.payload);
                    // Не перезаписываем существующие уведомления при ошибке
                    if (state.notifications.length === 0) {
                        state.notifications = [];
                    }
                    console.log(`📬 [Notifications] Загружено уведомлений из БД: 0 (неверный формат данных)`);
                }
                state.loading = false;
                state.error = null;
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
