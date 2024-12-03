import { api } from '../instance';
import { usersAPI } from '../users/usersAPI';

const formatDate = (date) => {
    return date instanceof Date 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : date;
};

const websiteAdvertisingAPI = {
    calculateCost: async (startDate, endDate) => {
        console.log('Calculating cost for dates:', {
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
            console.log('Cost calculation response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Cost calculation error:', {
                error: error.response?.data || error,
                sentData: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
            });
            throw error;
        }
    },

    createAdvertisement: async (data) => {
        console.log('Starting advertisement creation with data:', data);
        
        try {
            // Проверяем баланс перед созданием рекламы
            const hasEnoughBalance = await usersAPI.checkBalanceForAd(data.total_cost);
            if (!hasEnoughBalance) {
                throw new Error('Недостатньо коштів на балансі');
            }

            const formattedData = {
                book: parseInt(data.book),
                location: data.location,
                start_date: formatDate(data.start_date),
                end_date: formatDate(data.end_date),
                total_cost: data.total_cost
            };
            
            console.log('Formatted data for backend:', formattedData);

            const response = await api.post('/website-advertising/advertisements/', formattedData);
            console.log('Advertisement creation successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Advertisement creation error:', error);
            if (error.response?.data) {
                throw new Error(error.response.data.detail || error.response.data.error || error.message);
            }
            throw error;
        }
    },

    getMainPageAds: async () => {
        console.log('Starting getMainPageAds request');
        try {
            const response = await api.get('/website-advertising/advertisements/main_page_ads/');
            console.log('Main page ads received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching main page ads:', {
                error: error.response?.data || error,
                status: error.response?.status
            });
            throw error;
        }
    }
};

export { websiteAdvertisingAPI };
