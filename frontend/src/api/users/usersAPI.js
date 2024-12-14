import { api } from '../instance';

let purchaseInProgress = false;
let lastPurchaseTime = 0;
const PURCHASE_COOLDOWN = 5000; // 5 секунд между попытками

export const usersAPI = {
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTranslatorsList: () => {
        return api.get('/users/translators/').then(response => response.data);
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

            const response = await api.post(`/users/purchase-chapter/${chapterId}/`, null, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

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
    
    depositBalance: async (amount) => {
        const response = await api.post('/users/add-balance/', { amount });
        return response.data;
    },
    
    withdrawBalance: async (amount) => {
        const response = await api.post('/users/withdraw-balance/', 
            { amount },
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );
        return response.data;
    },
    
    getUserBalance: async () => {
        try {
            const response = await api.get('/users/profile/');
            return { balance: response.data.balance };
        } catch (error) {
            console.error('Error fetching user balance:', error);
            throw error;
        }
    },
    
    checkBalanceForAd: async (total_cost) => {
        try {
            const response = await api.get('/users/profile/');
            return response.data.balance >= total_cost;
        } catch (error) {
            console.error('Error checking balance:', error);
            throw error;
        }
    }
};