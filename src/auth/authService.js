import instance from '../api/instance';

// Сервіс для роботи з авторизацією
export const authService = {
    // Вхід користувача
    async login(credentials) {
        try {
            const response = await instance.post('/auth/login/', credentials);
            
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Реєстрація користувача
    async register(userData) {
        try {
            const response = await instance.post('/auth/register/', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Вихід користувача
    async logout() {
        try {
            await instance.post('/auth/logout/');
        } catch (error) {
            console.warn('Помилка при виході:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    // Оновлення токену
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('Немає refresh токену');
            }

            const response = await instance.post('/auth/refresh/', {
                refresh: refreshToken
            });

            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }

            return response.data;
        } catch (error) {
            // Додаткова обробка помилок з'єднання
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.error('🌐 Помилка з\'єднання з сервером в authService.getProfile');
                throw new Error('Помилка з\'єднання з сервером');
            }
            
            throw error;
        }
    },

    // Отримання профілю користувача
    async getProfile() {
        try {
            const response = await instance.get('/users/profile/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Перевірка чи користувач авторизований
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        return !!token;
    },

    // Отримання поточного користувача
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};



