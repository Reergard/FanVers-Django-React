import { api } from '../api/instance';
import tokenService from './tokenService';
import { handleAuthError } from './utils/authErrorUtils';

// Дедупликация запросов профиля
let profilePromise = null;

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
        // Очищаем заголовки axios при обычном логауте
        if (typeof window !== 'undefined') {
            delete api.defaults.headers.common.Authorization;
        }
        // Останавливаем мониторинг токенов при обычном логауте
        tokenService.stopTokenMonitoring();
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
        // Дедупликация: если уже идет запрос профиля, возвращаем тот же промис
        if (profilePromise) {
            console.log('Profile request already in progress, reusing promise');
            return profilePromise;
        }
        
        profilePromise = (async () => {
            try {
                // Интерсептор автоматически обработает refresh токена при 401
                const response = await api.get('/users/profile/');
                return response.data;
            } catch (error) {
                console.error('authService.getProfile error:', error);
                
                const status = error?.response?.status;
                
            if (status === 429) {
                const ra = error?.response?.headers?.['retry-after'];
                const retryAfter = Number.isFinite(+ra) ? parseInt(ra, 10) : 30;
                console.warn(`Profile request throttled, retry after ${retryAfter}s`);
                throw { 
                    code: 'THROTTLED', 
                    retryAfter, 
                    message: 'Забагато запитів до профілю' 
                };
            }

            if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
                throw { code: 'NETWORK', message: "Помилка з'єднання з сервером" };
            }

            // всё остальное — через унифицированный маппер ошибок
            const userMessage = handleAuthError(error);
            throw userMessage;
            } finally {
                // Очищаем промис после завершения (успешного или с ошибкой)
                profilePromise = null;
            }
        })();
        
        return profilePromise;
    },

    updateProfile: async (profileData) => {
        try {
            // Интерсептор автоматически обработает refresh токена при 401
            const response = await api.put('/users/profile/detail/', profileData);
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
