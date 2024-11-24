import { api } from '../instance';

const fetchRating = async (slug) => {
    try {
        const response = await api.get(`/rating/book/${slug}/rating/`);
        return response.data;
    } catch (error) {
        console.log(error.message);
    }
};

const postRating = async (slug, score) => {
    try {
        const response = await api.post(`/rating/book/${slug}/rating/`, { score });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const ratingAPI = {
    fetchRating,
    postRating
};

export { fetchRating, postRating };