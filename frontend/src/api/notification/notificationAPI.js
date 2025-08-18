import { api } from '../instance';

let currentRequestId = 0;

export const notificationAPI = {
    async getNotifications(version) {
        const requestId = ++currentRequestId;

        try {
            const response = await api.get('/notification/notifications/', {
                headers: {
                    'X-Request-ID': requestId,
                    'Cache-Control': 'no-cache'
                },
                params: { version }
            });

            if (requestId !== currentRequestId) {
                return null;
            }

            // Проверяем, что response.data существует и содержит notifications
            if (!response.data || !response.data.notifications) {
                console.warn('Invalid response format:', response.data);
                return {
                    data: [],
                    version: version || '0',
                    changed: false,
                    requestId
                };
            }

            const uniqueNotifications = [...new Map(
                response.data.notifications.map(item => [item.id, item])
            ).values()];

            return {
                data: uniqueNotifications,
                version: response.data.version || version || '0',
                changed: true,
                requestId
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },
    
    markAsRead(notificationId) {
        return api.patch(`/notification/notifications/${notificationId}/mark_as_read/`);
    },
    
    deleteNotification(notificationId) {
        return api.delete(`/notification/notifications/${notificationId}/`);
    },
    
    createNotification(notificationData) {
        console.log('Creating notification with data:', notificationData);
        return api.post('/notification/notifications/', notificationData)
            .then(response => {
                console.log('Notification creation successful:', response);
                return response;
            })
            .catch(error => {
                console.error('Notification creation failed:', error);
                console.error('Error response:', error.response?.data);
                throw error;
            });
    }
};
