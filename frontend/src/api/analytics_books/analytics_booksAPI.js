import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const analyticsBooksAPI = {
    fetchTrendingBooks: async (type) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/trending/`, {
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
            const response = await axios.post(`${API_BASE_URL}/analytics/update/`, {
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