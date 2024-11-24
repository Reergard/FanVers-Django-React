import { api } from '../instance';

export const usersAPI = {
    getProfile: async () => {
        try {
            const response = await api.get('/auth/users/me/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    updateProfile: async (userData) => {
        const response = await api.put('/auth/users/me/', userData);
        return response.data;
    },
    
    fetchProfile: async () => {
        const response = await api.get('/profile/');
        return response.data;
    },
    
    purchaseChapter: async (chapterId) => {
        const response = await api.post(`/users/purchase-chapter/${chapterId}/`);
        return response.data;
    }
};