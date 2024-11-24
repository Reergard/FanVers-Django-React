import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик для установки токена авторизации
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Получаем JWT токен
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Используем Bearer схему для JWT
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Добавляем перехватчик ответов для обработки ошибок авторизации
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Если получаем 401, пробуем обновить токен
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.refresh) {
                try {
                    const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                        refresh: user.refresh
                    });
                    localStorage.setItem('token', response.data.access);
                    // Обновляем токен в исходном запросе и повторяем его
                    error.config.headers.Authorization = `Bearer ${response.data.access}`;
                    return axios(error.config);
                } catch (refreshError) {
                    // Если не удалось обновить токен, очищаем хранилище
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getChapterNavigation = async (bookSlug, chapterSlug) => {
    try {
        const response = await axios.get(
            `${API_URL}/navigation/books/${bookSlug}/chapters/${chapterSlug}/navigation/`
        );
        console.log('Получены данные навигации:', response.data);
        return response;
    } catch (error) {
        console.error('Ошибка при получении навигации:', error);
        throw error;
    }
};

export const getBookmarksByStatus = async (status) => {
    try {
        const { data } = await api.get(`/navigation/bookmarks/status/${status}/`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const addBookmark = async (bookId, status) => {
    try {
        const { data } = await api.post('/navigation/bookmarks/', {
            book_id: bookId,
            status: status
        });
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateBookmark = async (bookmarkId, status) => {
    try {
        const { data } = await api.patch(`/navigation/bookmarks/${bookmarkId}/`, {
            status: status
        });
        return data;
    } catch (error) {
        throw error;
    }
};

export const getBookmarkStatus = async (bookId) => {
    try {
        const { data } = await api.get(`/navigation/bookmarks/status/${bookId}/`);
        return data;
    } catch (error) {
        return null;
    }
};
