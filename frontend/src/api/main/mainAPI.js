import { api } from '../instance';

const mainAPI = {
    getBooksNews: async () => {
        console.log("Початок виконання getBooksNews");
        try {
            const response = await api.get('/main/books-news/');
            console.log("Отримано відповідь від сервера:", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні книг:", error);
            throw new Error('Помилка при завантаженні рекомендованих книг');
        }
    },
    
};

export { mainAPI }; 