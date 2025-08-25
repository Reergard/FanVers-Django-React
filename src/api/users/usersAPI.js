import instance from '../instance';

// API для роботи з користувачами
export const usersAPI = {
    // Отримання профілю користувача
    async getProfile() {
        try {
            const response = await instance.get('/users/profile/');
            return response.data;
        } catch (error) {
            // Додаткова обробка помилок з'єднання
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.error('🌐 Помилка з\'єднання з сервером в getProfile');
                throw new Error('Помилка з\'єднання з сервером');
            }
            
            throw error;
        }
    },

    // Оновлення профілю користувача
    async updateProfile(profileData) {
        try {
            const response = await instance.put('/users/profile/', profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Зміна пароля
    async changePassword(passwordData) {
        try {
            const response = await instance.post('/users/change-password/', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Отримання списку користувачів (для адміністраторів)
    async getUsersList() {
        try {
            const response = await instance.get('/users/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Блокування/розблокування користувача (для адміністраторів)
    async toggleUserStatus(userId, isActive) {
        try {
            const response = await instance.patch(`/users/${userId}/toggle-status/`, {
                is_active: isActive
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};



