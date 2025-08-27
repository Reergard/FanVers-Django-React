import { api } from '../instance';

let purchaseInProgress = false;
let lastPurchaseTime = 0;
const PURCHASE_COOLDOWN = 5000; // 5 секунд между попытками

export const usersAPI = {
    // ⚠️ ВАЖЛИВО: Авторизація автоматично додається через instance.js interceptor
    // Всі API виклики автоматично отримують JWT токен
    // НЕ додавайте заголовок Authorization вручну!
    
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile/');
            return response.data;
        } catch (error) {
            console.error('usersAPI.getProfile error:', error);
            
            // Додаткова обробка помилок з'єднання
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.error('🌐 Помилка з\'єднання з сервером в getProfile');
                throw new Error('Помилка з\'єднання з сервером');
            }
            
            throw error;
        }
    },

    getTranslatorsList: () => {
        return api.get('/users/translators/').then(response => response.data);
    },
    
    getAuthorsList: () => {
        console.log("🌐 API: Запит на отримання списку авторів");
        return api.get('/users/authors/').then(response => {
            console.log("✅ API: Отримано відповідь:", response.data);
            return response.data;
        }).catch(error => {
            console.error("❌ API: Помилка при отриманні авторів:", error);
            throw error;
        });
    },
    
    getUserProfile: (username) => {
        return api.get(`/users/profile/${username}/`).then(response => response.data);
    },
    
    updateBalance: async (amount) => {
        try {
            const response = await api.post('/users/update-balance/', { amount });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Сервіс тимчасово недоступний');
            }
            throw error;
        }
    },
    
    purchaseChapter: async (chapterId) => {
        const now = Date.now();
        
        if (purchaseInProgress) {
            throw new Error('Купівля вже в процесі');
        }

        if (now - lastPurchaseTime < PURCHASE_COOLDOWN) {
            throw new Error('Будь ласка, зачекайте перед наступною спробою');
        }

        try {
            purchaseInProgress = true;
            lastPurchaseTime = now;

            const response = await api.post(`/users/purchase-chapter/${chapterId}/`, null);

            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                throw new Error('Занадто багато запитів. Будь ласка, зачекайте хвилину');
            }
            throw error;
        } finally {
            setTimeout(() => {
                purchaseInProgress = false;
            }, PURCHASE_COOLDOWN);
        }
    },
    
    becomeTranslator: async () => {
        try {
            const response = await api.post('/users/become-translator/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    becomeAuthor: async () => {
        try {
            const response = await api.post('/users/become-author/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    depositBalance: async (amount) => {
        const response = await api.post('/users/add-balance/', { amount });
        return response.data;
    },
    
    withdrawBalance: async (amount) => {
        const response = await api.post('/users/withdraw-balance/', { amount });
        return response.data;
    },
    
    getUserBalance: async () => {
        try {
            const response = await api.get('/users/profile/');
            // Проверяем, есть ли поле balance в ответе
            const balance = response.data.balance !== undefined ? response.data.balance : 0;
            return { balance: balance };
        } catch (error) {
            console.error('Error fetching user balance:', error);
            // Возвращаем fallback значение в случае ошибки
            return { balance: 0 };
        }
    },
    
    checkBalanceForAd: async (total_cost) => {
        try {
            const response = await api.get('/users/profile/');
            const balance = response.data.balance !== undefined ? response.data.balance : 0;
            return balance >= total_cost;
        } catch (error) {
            console.error('Error checking balance:', error);
            // В случае ошибки считаем, что баланса недостаточно
            return false;
        }
    },

    // Нові методи для оновлення профілю
    uploadProfileImage: async (imageFile) => {
        try {
            const formData = new FormData();
            // Важно: поле 'image' відповідає ProfileImageUploadSerializer
            formData.append('image', imageFile);
            
            const response = await api.post('/users/profile/upload-image/', formData);
            return response.data;
        } catch (error) {
            console.error('usersAPI.uploadProfileImage error:', error);
            
            // Спеціальна обробка помилки 429
            if (error.response?.status === 429) {
                throw new Error('Занадто багато спроб завантаження. Спробуйте через годину.');
            }
            
            throw error;
        }
    },

    deleteProfileImage: async () => {
        try {
            const response = await api.delete('/users/profile/delete-image/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateEmail: async (newEmail) => {
        try {
            const response = await api.post('/users/profile/update-email/', {
                new_email: newEmail
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (oldPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.post('/users/profile/change-password/', {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateNotificationSettings: async (settings) => {
        try {
            const response = await api.put('/users/profile/notification-settings/', settings);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Метод для отримання закладок користувача
    getUserBookmarks: async (status = null) => {
        try {
            let url = '/navigation/bookmarks/';
            if (status && status !== 'all') {
                url += `?status=${status}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching user bookmarks:', error);
            throw error;
        }
    }
};