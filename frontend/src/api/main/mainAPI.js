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
    
    getAuthorAgreement: async () => {
        console.log("Початок виконання getAuthorAgreement");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/author-agreement/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (авторский договор):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні авторского договора:", error);
            throw new Error('Помилка при завантаженні авторского договора');
        }
    },
    
    getPrivacyPolicy: async () => {
        console.log("Початок виконання getPrivacyPolicy");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/privacy-policy/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (политика конфиденциальности):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні политики конфиденциальности:", error);
            throw new Error('Помилка при завантаженні политики конфиденциальности');
        }
    },
    
    getContentRules: async () => {
        console.log("Початок виконання getContentRules");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/content-rules/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (правила размещения контента):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні правил размещения контента:", error);
            throw new Error('Помилка при завантаженні правил размещения контента');
        }
    },
    
    getTranslatorAgreement: async () => {
        console.log("Початок виконання getTranslatorAgreement");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/translator-agreement/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (договор автор-переводчик):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні договора автор-переводчик:", error);
            throw new Error('Помилка при завантаженні договора автор-переводчик');
        }
    },
    
    getUserAgreement: async () => {
        console.log("Початок виконання getUserAgreement");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/user-agreement/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (угода пользователя):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні угоды пользователя:", error);
            throw new Error('Помилка при завантаженні угоды пользователя');
        }
    },
    
    getCopyrightHolders: async () => {
        console.log("Початок виконання getCopyrightHolders");
        try {
            const response = await retryWithBackoff(
                () => api.get('/main/copyright-holders/'),
                3, // максимум 3 повторные попытки
                2000 // базовая задержка 2 секунды
            );
            console.log("Отримано відповідь від сервера (для правовладельцев):", response.data);
            return response.data;
        } catch (error) {
            console.error("Помилка при отриманні информации для правовладельцев:", error);
            throw new Error('Помилка при завантаженні информации для правовладельцев');
        }
    },
    
};

export { mainAPI }; 
