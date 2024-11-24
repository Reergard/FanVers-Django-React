import axios from 'axios';
import authService from '../auth/authService';

const BACKEND_DOMAIN = "http://localhost:8000";
const CHAT_URL = `${BACKEND_DOMAIN}/api/chat/`;

// Создаем инстанс axios с базовой конфигурацией
const api = axios.create({
    baseURL: BACKEND_DOMAIN,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик для обновления токена
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Попытка обновить токен
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await authService.refreshToken(refreshToken);
                
                if (response.access) {
                    localStorage.setItem('token', response.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Если не удалось обновить токен, перенаправляем на логин
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const chatApi = {
    getChatList: async () => {
        try {
            const response = await api.get('/api/chat/');
            return response.data;
        } catch (error) {
            console.error('Error getting chat list:', error);
            throw error;
        }
    },

    createChat: async (username, message) => {
        try {
            const response = await api.post('/api/chat/create/', { username, message });
            return response.data;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    },

    getChatMessages: async (chatId) => {
        try {
            const response = await api.get(`/api/chat/${chatId}/messages/`);
            return response.data;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    },

    sendMessage: async (chatId, content) => {
        try {
            const response = await api.post(`/api/chat/${chatId}/send_message/`, {
                content: content,
                chat_id: chatId
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            await api.delete(`/api/chat/${chatId}/`);
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    }
};

export default chatApi;