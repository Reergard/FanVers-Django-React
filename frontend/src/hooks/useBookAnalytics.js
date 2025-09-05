import { useCallback, useRef } from 'react';
import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const useBookAnalytics = () => {
    const pendingRequests = useRef(new Map());
    const lastRequestTime = useRef(new Map());
    const MIN_INTERVAL = 5000; // Минимальный интервал между запросами аналитики (5 секунд)

    const updateAnalytics = useCallback(async (bookId, actionType) => {
        console.log('updateAnalytics вызван с параметрами:', { bookId, actionType });
        
        if (!bookId) {
            console.error('updateAnalytics: bookId не предоставлен');
            return;
        }

        // Создаем уникальный ключ для запроса
        const requestKey = `${bookId}_${actionType}`;
        
        // Проверяем временной интервал
        const now = Date.now();
        const lastTime = lastRequestTime.current.get(requestKey) || 0;
        const timeSinceLastRequest = now - lastTime;
        
        if (timeSinceLastRequest < MIN_INTERVAL) {
            console.log(`Analytics request for ${requestKey} is too frequent, skipping...`);
            return;
        }
        
        // Проверяем, есть ли уже запрос для этого ключа
        if (pendingRequests.current.has(requestKey)) {
            console.log(`Analytics request for ${requestKey} is already pending, skipping...`);
            return;
        }

        // bookId теперь может быть как slug, так и id
        const payload = {
            book_id: bookId.toString(), // Преобразуем в строку для безопасности
            action_type: actionType
        };
        console.log('Отправляемые данные:', payload);

        // Добавляем запрос в pending и обновляем время
        pendingRequests.current.set(requestKey, true);
        lastRequestTime.current.set(requestKey, now);

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
            
            // Обработка ошибки 429 (Too Many Requests)
            if (error.response?.status === 429) {
                console.log('Analytics rate limit exceeded, request will be retried later');
                // Не выбрасываем ошибку для 429, чтобы не нарушать UX
                return;
            }
            
            throw error;
        } finally {
            // Удаляем запрос из pending
            pendingRequests.current.delete(requestKey);
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
