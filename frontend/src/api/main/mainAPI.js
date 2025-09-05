import { api } from '../instance';
import { retryWithBackoff } from '../../utils/retryUtils';

const mainAPI = {
    getBooksNews: async () => {
        console.log("Початок виконання getBooksNews");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/books-news/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера:", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні книг:", error);
            throw new Error('Помилка при завантаженні рекомендованих книг');
        }
    },
    
};

export { mainAPI }; 
