import { api } from '../instance';

const analyticsBooksAPI = {
    fetchTrendingBooks: async (type) => {
        try {
            const response = await api.get('/analytics/trending/', {
                params: { type }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении трендовых книг:', error);
            throw error;
        }
    },

    updateAnalytics: async (bookId, actionType) => {
        try {
            const response = await api.post('/analytics/update/', {
                book_id: bookId,
                action_type: actionType
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при обновлении аналитики:', error);
            throw error;
        }
    }
};

export { analyticsBooksAPI }; 