import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/reviews';

const getAuthToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для запросов
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Интерцептор для ответов
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Обработка истекшего токена
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const fetchBookComments = async (bookSlug) => {
    try {
        const response = await axiosInstance.get(`/book/${bookSlug}/comments/`);
        // Проверяем, что данные являются массивом
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching book comments:', 
            error.response?.data || error.message
        );
        return []; // Возвращаем пустой массив вместо throw error
    }
};

export const postBookComment = async (bookSlug, text, parentId = null) => {
    try {
        const response = await axiosInstance.post(`/book/${bookSlug}/comments/`, {
            text,
            parent: parentId
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при отправке комментария к книге:', 
            error.response?.data || error.message
        );
        throw new Error('Не удалось отправить комментарий');
    }
};

export const fetchChapterComments = async (chapterSlug) => {
    try {
        const response = await axiosInstance.get(`/chapter/${chapterSlug}/comments/`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching chapter comments:', 
            error.response?.data || error.message
        );
        return []; // Возвращаем пустой массив вместо throw error
    }
};

export const postChapterComment = async (chapterSlug, text, parentId = null) => {
    try {
        const response = await axiosInstance.post(`/chapter/${chapterSlug}/comments/`, {
            text,
            parent: parentId
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при отправке комментария к главе:', 
            error.response?.data || error.message
        );
        throw new Error('Не удалось отправить комментарий');
    }
};

export const updateReaction = async (commentId, type, action) => {
    try {
        const response = await axiosInstance.post(`/${type}-comment/${commentId}/update_reaction/`, {
            action
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении реакции:', 
            error.response?.data || error.message
        );
        throw new Error('Не удалось обновить реакцию');
    }
};

export default axiosInstance;
