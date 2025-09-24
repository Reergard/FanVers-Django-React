import { api } from '../instance';

export const monitoringAPI = {
    updateReadingProgress: async (chapterId, data) => {
        try {
            const response = await api.post(
                `/monitoring/chapters/${chapterId}/progress/`, 
                data
            );
            return response.data;
        } catch (error) {
            throw new Error('Помилка при оновленні прогресу читання');
        }
    },

    getChapterProgress: async (chapterId) => {
        try {
            const response = await api.get(
                `/monitoring/chapters/${chapterId}/progress/`
            );
            return response.data;
        } catch (error) {
            throw new Error('Помилка при отриманні прогресу читання');
        }
    },

    getUserReadingStats: async () => {
        try {
            const response = await api.get('/monitoring/stats/');
            return response.data;
        } catch (error) {
            throw new Error('Помилка при отриманні статистики читання');
        }
    },

    updateChapterProgress: async (chapterId, progressData) => {
        try {
            const response = await api.post(
                `/monitoring/chapters/${chapterId}/progress/`,
                progressData
            );
            console.log('Progress update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating chapter progress:', error);
            throw error;
        }
    },

    sendAuthorThanks: async (bookId, amount, message = '') => {
        try {
            // Базовая валидация на фронтенде (только критические проверки)
            if (!bookId || bookId <= 0) {
                throw new Error('Невірний ID книги');
            }
            
            if (!amount || isNaN(amount)) {
                throw new Error('Невірна сума подяки');
            }

            const response = await api.post('/monitoring/thanks/', {
                book_id: bookId,
                amount: amount,
                message: message
            });
            return response.data;
        } catch (error) {
            console.error('Error sending author thanks:', error);
            
            // Обработка различных типов ошибок
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                switch (status) {
                    case 400:
                        if (errorData.error) {
                            throw new Error(errorData.error);
                        }
                        throw new Error('Невірні дані для подяки');
                    
                    case 429:
                        throw new Error('Занадто багато спроб. Зачекайте 5 хвилин перед наступною подякою');
                    
                    case 401:
                        throw new Error('Необхідна авторизація');
                    
                    case 403:
                        throw new Error('У вас немає прав для цієї дії');
                    
                    case 404:
                        throw new Error('Книга не знайдена');
                    
                    case 500:
                        throw new Error('Внутрішня помилка сервера. Спробуйте пізніше');
                    
                    default:
                        throw new Error('Помилка при відправці подяки. Спробуйте пізніше');
                }
            } else if (error.request) {
                throw new Error('Помилка з\'єднання з сервером. Перевірте інтернет-з\'єднання');
            } else {
                // Это ошибка валидации на фронтенде
                throw error;
            }
        }
    }
};
