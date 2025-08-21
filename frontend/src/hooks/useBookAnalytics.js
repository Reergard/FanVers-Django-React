import { useCallback } from 'react';
import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const useBookAnalytics = () => {
    const updateAnalytics = useCallback(async (bookId, actionType) => {
        console.log('updateAnalytics вызван с параметрами:', { bookId, actionType });
        
        if (!bookId) {
            console.error('updateAnalytics: bookId не предоставлен');
            return;
        }

        // bookId теперь может быть как slug, так и id
        const payload = {
            book_id: bookId.toString(), // Преобразуем в строку для безопасности
            action_type: actionType
        };
        console.log('Отправляемые данные:', payload);

        try {
            console.log('Отправка запроса на:', '/api/analytics_books/update/');
            const response = await axiosInstance.post('/api/analytics_books/update/', payload);
            console.log('Ответ сервера:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating analytics:', error);
            console.log('Конфигурация запроса:', error.config);
            console.log('Статус ответа:', error.response?.status);
            console.log('Данные ответа:', error.response?.data);
            throw error;
        }
    }, []);

    const trackView = useCallback((bookId) => {
        console.log('trackView вызван для книги:', bookId);
        return updateAnalytics(bookId, 'view');
    }, [updateAnalytics]);

    const trackComment = useCallback((bookId) => {
        console.log('trackComment вызван для книги:', bookId);
        return updateAnalytics(bookId, 'comment');
    }, [updateAnalytics]);

    const trackBookRating = useCallback((bookId) => {
        console.log('trackBookRating вызван для книги:', bookId);
        return updateAnalytics(bookId, 'book_rating');
    }, [updateAnalytics]);

    const trackTranslationRating = useCallback((bookId) => {
        console.log('trackTranslationRating вызван для книги:', bookId);
        return updateAnalytics(bookId, 'translation_rating');
    }, [updateAnalytics]);

    const trackCommentLike = useCallback((bookId) => {
        console.log('trackCommentLike вызван для книги:', bookId);
        return updateAnalytics(bookId, 'comment_like');
    }, [updateAnalytics]);

    const trackBookmark = useCallback((bookId) => {
        console.log('trackBookmark вызван для книги:', bookId);
        return updateAnalytics(bookId, 'bookmark');
    }, [updateAnalytics]);

    return {
        trackView,
        trackComment,
        trackBookRating,
        trackTranslationRating,
        trackCommentLike,
        trackBookmark
    };
};

export default useBookAnalytics; 