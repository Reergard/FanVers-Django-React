import { api } from '../instance';

const catalogAPI = {
    getBooks: async () => {
        try {
            const response = await api.get('/catalog/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export { catalogAPI }; 