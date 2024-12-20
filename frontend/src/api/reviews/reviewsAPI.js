import { api } from '../instance';

const fetchBookComments = async (bookSlug) => {
    try {
        const response = await api.get(`/reviews/book/${bookSlug}/comments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Помилка при отриманні коментарів до книги:', 
            error.response?.data || error.message
        );
        return [];
    }
};

const postBookComment = async (bookSlug, text, parentId = null) => {
    try {
        const response = await api.post(`/reviews/book/${bookSlug}/comments/`, {
            text,
            parent: parentId
        });
        return response.data;
    } catch (error) {
        console.error('Помилка при надсиланні коментаря до книги:', 
            error.response?.data || error.message
        );
        throw new Error('Не вдалося надіслати коментар');
    }
};

const fetchChapterComments = async (chapterSlug) => {
    try {
        const response = await api.get(`/reviews/chapter/${chapterSlug}/comments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Помилка при отриманні коментарів до глави:', 
            error.response?.data || error.message
        );
        return [];
    }
};

const postChapterComment = async (chapterSlug, text, parentId = null) => {
    try {
        const response = await api.post(`/reviews/chapter/${chapterSlug}/comments/`, {
            text,
            parent: parentId
        });
        return response.data;
    } catch (error) {
        console.error('Помилка при надсиланні коментаря до глави:', 
            error.response?.data || error.message
        );
        throw new Error('Не вдалося надіслати коментар');
    }
};

const updateReaction = async (commentId, type, action) => {
    try {
        const response = await api.post(`/reviews/${type}-comment/${commentId}/update_reaction/`, {
            action
        });
        return response.data;
    } catch (error) {
        console.error('Помилка при оновленні реакції:', 
            error.response?.data || error.message
        );
        throw new Error('Не вдалося оновити реакцію');
    }
};

const updateOwnerLike = async (commentId, commentType) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необхідна авторизація');
    }

    try {
        const response = await api.post(
            `/reviews/${commentType}/${commentId}/owner_like/`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Помилка при оновленні реакції власника:', error.response?.data || error.message);
        throw new Error('Не вдалося оновити реакцію власника');
    }
};

export const reviewsAPI = {
    fetchBookComments,
    postBookComment,
    fetchChapterComments,
    postChapterComment,
    updateReaction,
    updateOwnerLike,
};

export {
    fetchBookComments,
    postBookComment,
    fetchChapterComments,
    postChapterComment,
    updateReaction,
    updateOwnerLike,
};