import { api } from '../instance';

const fetchBookComments = async (bookSlug) => {
    try {
        const response = await api.get(`/reviews/book/${bookSlug}/comments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Помилка при отриманні коментарів до книги:', 
            error.response?.data || error.message
        );
        
        // Обработка различных типов ошибок
        if (error.response?.status === 404) {
            console.warn('Книгу не знайдено для завантаження коментарів');
        } else if (error.response?.status >= 500) {
            console.error('Внутренняя ошибка сервера при завантаженні коментарів');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('Помилка з\'єднання з сервером при завантаженні коментарів');
        }
        
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
        
        // Обработка различных типов ошибок
        if (error.response?.status === 400) {
            const errorMessage = error.response.data?.text?.[0] || error.response.data?.detail || 'Некорректные данные комментария';
            throw new Error(errorMessage);
        } else if (error.response?.status === 401) {
            throw new Error('Необхідна авторизація для коментування');
        } else if (error.response?.status === 403) {
            throw new Error(error.response?.data?.detail || 'У вас немає прав для коментування цієї книги');
        } else if (error.response?.status === 404) {
            throw new Error('Книгу не знайдено');
        } else if (error.response?.status === 429) {
            throw new Error('Занадто багато спроб. Спробуйте через хвилину');
        } else if (error.response?.status >= 500) {
            throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            throw new Error('Помилка з\'єднання з сервером');
        }
        
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
        
        if (error.response?.status === 403) {
            throw new Error(error.response?.data?.detail || 'У вас немає прав для коментування цього розділу');
        }
        
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
        
        // Обработка различных типов ошибок
        if (error.response?.status === 400) {
            throw new Error(error.response.data?.error || 'Некорректные данные для реакции');
        } else if (error.response?.status === 401) {
            throw new Error('Необхідна авторизація для реакції');
        } else if (error.response?.status === 404) {
            throw new Error('Коментар не знайдено');
        } else if (error.response?.status >= 500) {
            throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            throw new Error('Помилка з\'єднання з сервером');
        }
        
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
            `/reviews/${commentType}-comment/${commentId}/owner_like/`,
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
        
        // Обработка различных типов ошибок
        if (error.response?.status === 400) {
            throw new Error(error.response.data?.error || 'Некорректные данные для реакции власника');
        } else if (error.response?.status === 401) {
            throw new Error('Необхідна авторизація для реакції власника');
        } else if (error.response?.status === 403) {
            throw new Error('Тільки власник книги може ставити цей лайк');
        } else if (error.response?.status === 404) {
            throw new Error('Коментар не знайдено');
        } else if (error.response?.status >= 500) {
            throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            throw new Error('Помилка з\'єднання з сервером');
        }
        
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
