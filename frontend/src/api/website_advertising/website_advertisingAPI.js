import { api } from '../instance';
import { usersAPI } from '../users/usersAPI';
import axios from 'axios';

const formatDate = (date) => {
    return date instanceof Date 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : date;
};

const websiteAdvertisingAPI = {
    calculateCost: async (startDate, endDate) => {
        console.log('Розрахунок вартості для дат:', {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            rawStartDate: startDate,
            rawEndDate: endDate
        });

        try {
            const response = await api.post('/website-advertising/advertisements/calculate_cost/', {
                start_date: formatDate(startDate),
                end_date: formatDate(endDate)
            });
            console.log('Відповідь розрахунку вартості:', response.data);
            return response.data;
        } catch (error) {
            console.error('Помилка розрахунку вартості:', {
                error: error.response?.data || error,
                sentData: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
            });
            throw error;
        }
    },

    createAdvertisement: async (data) => {
        console.log('Початок створення оголошення з даними:', data);
        
        try {
            // Перевіряємо баланс перед створенням реклами
            const hasEnoughBalance = await usersAPI.checkBalanceForAd(data.total_cost);
            if (!hasEnoughBalance) {
                throw new Error('Недостатньо коштів на балансі');
            }

            // Форматуємо дати
            const formattedData = {
                book: parseInt(data.book),
                location: data.location,
                start_date: formatDate(data.start_date),
                end_date: formatDate(data.end_date)
            };
            
            console.log('Форматовані дані для бекенду:', formattedData);

            try {
                const response = await api.post('/website-advertising/advertisements/', formattedData);
                console.log('Оголошення успішно створено:', response.data);
                return response.data;
            } catch (error) {
                console.error('Деталі помилки:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    config: error.config
                });

                // Форматуємо повідомлення про помилку
                let errorMessage = 'Помилка створення оголошення';
                if (error.response?.data) {
                    if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else if (error.response.data.non_field_errors) {
                        errorMessage = error.response.data.non_field_errors[0];
                    } else {
                        // Якщо є помилки по конкретних полях
                        const fieldErrors = Object.entries(error.response.data)
                            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
                            .join('; ');
                        if (fieldErrors) {
                            errorMessage = fieldErrors;
                        }
                    }
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Помилка створення оголошення:', {
                error: error.response?.data || error,
                status: error.response?.status,
                sentData: data
            });
            throw error;
        }
    },

    getMainPageAds: async () => {
        console.log('Початок запиту getMainPageAds');
        try {
            const response = await api.get('/website-advertising/advertisements/main_page_ads/');
            console.log('Отримано оголошення головної сторінки:', response.data);
            return response.data;
        } catch (error) {
            console.error('Помилка отримання оголошень головної сторінки:', {
                error: error.response?.data || error,
                status: error.response?.status
            });
            throw error;
        }
    },

    getUserAdvertisements: async () => {
        console.log('Початок запиту getUserAdvertisements');
        try {
            const response = await api.get('/website-advertising/advertisements/user_advertisements/');
            console.log('Отримано рекламні оголошення користувача:', response.data);
            return response.data;
        } catch (error) {
            console.error('Помилка при отриманні реклами користувача:', error);
            throw error;
        }
    }
};

export { websiteAdvertisingAPI };
