import axios from 'axios';
import authService from '../auth/authService';

const BACKEND_DOMAIN = "http://localhost:8000";
const CHAT_URL = `${BACKEND_DOMAIN}/api/chat/`;

// Створюємо інстанс axios з базовою конфігурацією
const api = axios.create({
    baseURL: BACKEND_DOMAIN,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Додаємо перехоплювач для оновлення токену
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

// Додаємо перехоплювач для обробки помилок
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Спроба оновити токен
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await authService.refreshToken(refreshToken);
                
                if (response.access) {
                    localStorage.setItem('token', response.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Якщо не вдалося оновити токен, перенаправляємо на логін
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
            throw error;
        }
    },

    createChat: async (username, message) => {
        try {
            const response = await api.post('/api/chat/create/', { username, message });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getChatMessages: async (chatId) => {
        try {
            const response = await api.get(`/api/chat/${chatId}/messages/`);
            return response.data;
        } catch (error) {
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
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            await api.delete(`/api/chat/${chatId}/`);
        } catch (error) {
            throw error;
        }
    }
};

export default chatApi;