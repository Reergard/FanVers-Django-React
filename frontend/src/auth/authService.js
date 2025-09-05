import { api } from '../api/instance';
import tokenService from './tokenService';
import { handleAuthError } from './utils/authErrorUtils';

const authService = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/users/', userData);
            return response.data;
        } catch (error) {
            // Используем новую систему обработки ошибок
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    login: async (userData) => {
        try {
            const response = await api.post('/auth/jwt/create/', userData);
            if (response.data) {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
            }
            return response.data;
        } catch (error) {
            // Используем новую систему обработки ошибок
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    logout: () => {
        tokenService.clearTokens();
    },

    activate: async (userData) => {
        try {
            const response = await api.post('/auth/users/activation/', userData);
            return response.data;
        } catch (error) {
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    resetPassword: async (userData) => {
        try {
            const response = await api.post('/auth/users/reset_password/', userData);
            return response.data;
        } catch (error) {
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    resetPasswordConfirm: async (userData) => {
        try {
            const response = await api.post('/auth/users/reset_password_confirm/', userData);
            return response.data;
        } catch (error) {
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    getProfile: async () => {
        try {
            // Получаем актуальный токен перед запросом
            await tokenService.getValidToken();
            const response = await api.get('/users/profile/');
            return response.data;
        } catch (error) {
            console.error('authService.getProfile error:', error);
            
            // Додаткова обробка помилок з'єднання
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.error('Помилка з\'єднання з сервером в authService.getProfile');
                throw new Error('Помилка з\'єднання з сервером');
            }
            
            // Используем новую систему обработки ошибок
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    updateProfile: async (profileData) => {
        try {
            // Получаем актуальный токен перед запросом
            await tokenService.getValidToken();
            const response = await api.put('/auth/users/me/', profileData);
            return response.data;
        } catch (error) {
            const userMessage = handleAuthError(error);
            throw userMessage;
        }
    },

    // Новый метод для проверки токенов
    checkTokens: async () => {
        try {
            await tokenService.getValidToken();
            return true;
        } catch (error) {
            console.error('authService.checkTokens error:', error);
            return false;
        }
    }
};

export default authService;
