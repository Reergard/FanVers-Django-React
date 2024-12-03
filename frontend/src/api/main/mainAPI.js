import { api } from '../instance';

const mainAPI = {
    getBooksNews: async () => {
        console.log("Начало выполнения getBooksNews");
        try {
            const response = await api.get('/main/books-news/');
            console.log("Получен ответ от сервера:", response.data);
            return response.data;
        } catch (error) {
            console.error("Ошибка при получении книг:", error);
            throw new Error('Помилка при завантаженні рекомендованих книг');
        }
    },
    
};

export { mainAPI }; 