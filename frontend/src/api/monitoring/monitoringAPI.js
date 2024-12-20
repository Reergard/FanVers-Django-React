import { api } from '../instance';

export const monitoringAPI = {
    updateReadingProgress: async (chapterId, data) => {
        try {
            const response = await api.post(
                `/monitoring/chapters/${chapterId}/progress/`, 
                data
            );
            return response.data;
        } catch (error) {
            throw new Error('Помилка при оновленні прогресу читання');
        }
    },

    getChapterProgress: async (chapterId) => {
        try {
            const response = await api.get(
                `/monitoring/chapters/${chapterId}/progress/`
            );
            return response.data;
        } catch (error) {
            throw new Error('Помилка при отриманні прогресу читання');
        }
    },

    getUserReadingStats: async () => {
        try {
            const response = await api.get('/monitoring/stats/');
            return response.data;
        } catch (error) {
            throw new Error('Помилка при отриманні статистики читання');
        }
    },

    updateChapterProgress: async (chapterId, progressData) => {
        try {
            const response = await api.post(
                `/monitoring/chapters/${chapterId}/progress/`,
                progressData
            );
            console.log('Progress update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating chapter progress:', error);
            throw error;
        }
    }
};