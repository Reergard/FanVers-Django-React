import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatApi from '../api/chat/api';

const initialState = {
    chats: [],
    unreadMessages: 0,
    loading: false,
    error: null
};

// Async thunk для загрузки списка чатов
export const fetchChats = createAsyncThunk(
    'chat/fetchChats',
    async (_, thunkAPI) => {
        try {
            const response = await chatApi.getChatList();
            return response;
        } catch (error) {
            console.error('Error in fetchChats thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка завантаження чатів');
        }
    }
);

// Async thunk для загрузки сообщений чата
export const fetchChatMessages = createAsyncThunk(
    'chat/fetchChatMessages',
    async (chatId, thunkAPI) => {
        try {
            const response = await chatApi.getChatMessages(chatId);
            return { chatId, messages: response };
        } catch (error) {
            console.error('Error in fetchChatMessages thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка завантаження повідомлень');
        }
    }
);

// Async thunk для создания нового чата
export const createChat = createAsyncThunk(
    'chat/createChat',
    async ({ username, message }, thunkAPI) => {
        try {
            const response = await chatApi.createChat(username, message);
            return response;
        } catch (error) {
            console.error('Error in createChat thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка створення чату');
        }
    }
);

// Async thunk для удаления чата
export const deleteChat = createAsyncThunk(
    'chat/deleteChat',
    async (chatId, thunkAPI) => {
        try {
            await chatApi.deleteChat(chatId);
            return chatId;
        } catch (error) {
            console.error('Error in deleteChat thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка видалення чату');
        }
    }
);

// Async thunk для отметки чата как прочитанного
export const markChatAsRead = createAsyncThunk(
    'chat/markChatAsRead',
    async (chatId, thunkAPI) => {
        try {
            await chatApi.markChatAsRead(chatId);
            return chatId;
        } catch (error) {
            console.error('Error in markChatAsRead thunk:', error);
            return thunkAPI.rejectWithValue(error.message || 'Помилка відмітки чату як прочитаного');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Действие для обновления количества непрочитанных сообщений
        updateUnreadMessages: (state, action) => {
            state.unreadMessages = action.payload;
        },
        
        // Действие для отметки сообщений как прочитанных
        markMessagesAsRead: (state, action) => {
            const chatId = action.payload;
            const chat = state.chats.find(chat => chat.id === chatId);
            if (chat) {
                chat.unread_count = 0;
            }
            // Пересчитываем общее количество непрочитанных
            state.unreadMessages = state.chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
        },
        
        // Действие для добавления нового сообщения
        addMessage: (state, action) => {
            const { chatId, message, currentUsername } = action.payload;
            
            console.log('🔌 [ChatSlice] addMessage:', { chatId, message, currentUsername });
            
            // Проверяем, что currentUsername существует
            if (!currentUsername) {
                console.error('❌ [ChatSlice] currentUsername is undefined!');
                return;
            }
            
            const chat = state.chats.find(chat => chat.id === chatId);
            if (chat) {
                // Если это не наше сообщение, увеличиваем счетчик непрочитанных
                if (message.sender?.username !== currentUsername) {
                    chat.unread_count = (chat.unread_count || 0) + 1;
                    state.unreadMessages = state.chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
                    console.log('🔌 [ChatSlice] ✅ Unread count increased:', chat.unread_count);
                } else {
                    console.log('🔌 [ChatSlice] Own message, not increasing unread count');
                }
            } else {
                console.error('❌ [ChatSlice] Chat not found:', chatId);
            }
        },
        
        // Действие для очистки ошибок
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchChats
            .addCase(fetchChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload || [];
                // Пересчитываем количество непрочитанных сообщений
                state.unreadMessages = state.chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // createChat
            .addCase(createChat.fulfilled, (state, action) => {
                state.chats.unshift(action.payload);
            })
            
            // deleteChat
            .addCase(deleteChat.fulfilled, (state, action) => {
                const chatId = action.payload;
                state.chats = state.chats.filter(chat => chat.id !== chatId);
                // Пересчитываем количество непрочитанных сообщений
                state.unreadMessages = state.chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
            })
            
            // markChatAsRead
            .addCase(markChatAsRead.fulfilled, (state, action) => {
                const chatId = action.payload;
                const chat = state.chats.find(chat => chat.id === chatId);
                if (chat) {
                    chat.unread_count = 0;
                }
                // Пересчитываем количество непрочитанных сообщений
                state.unreadMessages = state.chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
            });
    }
});

export const { 
    updateUnreadMessages, 
    markMessagesAsRead, 
    addMessage, 
    clearError 
} = chatSlice.actions;

export default chatSlice.reducer;
