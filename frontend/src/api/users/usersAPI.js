import { api } from '../instance';

export const usersAPI = {
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile/');
            return response.data;
        } catch (error) {
            throw error;
        }
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
        try {
            const response = await api.post(`/users/purchase-chapter/${chapterId}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};