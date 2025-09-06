import { api } from '../instance';
import { retryWithBackoff } from '../../utils/retryUtils';

const mainAPI = {
    getBooksNews: async () => {
        console.log("Початок виконання getBooksNews (новые книги)");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/books-news/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (новые книги):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні нових книг:", error);
            throw new Error('Помилка при завантаженні нових книг');
        }
    },
    
    getBooksRecentUpdates: async () => {
        console.log("Початок виконання getBooksRecentUpdates (книги с обновлениями)");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/books-recent-updates/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (книги с обновлениями):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні книг з оновленнями:", error);
            throw new Error('Помилка при завантаженні книг з недавними оновленнями');
        }
    },
    
};

export { mainAPI }; 
