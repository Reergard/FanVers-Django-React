import { api } from '../instance';

let currentRequestId = 0;
let currentRequest = null;

export const notificationAPI = {
    async getNotifications(version) {
        // Если уже есть активный запрос, ждем его завершения
        if (currentRequest) {
            console.log(`📡 [NotificationAPI] Запрос уже выполняется, ждем завершения...`);
            return await currentRequest;
        }

        const requestId = ++currentRequestId;

        currentRequest = (async () => {
            try {
                const response = await api.get('/notification/notifications/', {
                    headers: {
                        'X-Request-ID': requestId,
                        'Cache-Control': 'no-cache'
                    },
                    params: { version }
                });

                if (requestId !== currentRequestId) {
                    return {
                        data: [],
                        version: version || '0',
                        changed: false,
                        requestId
                    };
                }

                // Проверяем, что response.data существует и содержит notifications
                if (!response.data) {
                    console.warn('No response data:', response);
                    return {
                        data: [],
                        version: version || '0',
                        changed: false,
                        requestId
                    };
                }

                // Если response.data является массивом напрямую (старый формат)
                if (Array.isArray(response.data)) {
                    // Дополнительная проверка на валидность элементов массива
                    const validNotifications = response.data.filter(item => 
                        item && typeof item === 'object' && item.id
                    );

                    const uniqueNotifications = [...new Map(
                        validNotifications.map(item => [item.id, item])
                    ).values()];

                    // Логируем данные в старом формате
                    console.log(`📡 [NotificationAPI] Получено в старом формате: ${response.data.length} уведомлений`);
                    console.log(`📡 [NotificationAPI] Валидных после фильтрации: ${uniqueNotifications.length} уведомлений`);

                    return {
                        data: uniqueNotifications,
                        version: version || '0',
                        changed: true,  // старый формат всегда считаем измененным
                        requestId
                    };
                }

                // Если response.data содержит notifications (новый формат)
                if (!response.data.notifications) {
                    console.warn('Invalid response format - no notifications field:', response.data);
                    return {
                        data: [],
                        version: version || '0',
                        changed: false,
                        requestId
                    };
                }

                // Проверяем, что notifications является массивом
                if (!Array.isArray(response.data.notifications)) {
                    console.warn('Invalid notifications format:', response.data.notifications);
                    return {
                        data: [],
                        version: response.data.version || version || '0',
                        changed: false,
                        requestId
                    };
                }

                // Проверяем версию для определения changed
                const respVersion = response.data.version ?? version ?? '0';
                const sameVersion = version != null && respVersion === version;

                // Дополнительная проверка на валидность элементов массива
                const validNotifications = response.data.notifications.filter(item => 
                    item && typeof item === 'object' && item.id
                );

                const uniqueNotifications = [...new Map(
                    validNotifications.map(item => [item.id, item])
                ).values()];

                // Логируем данные, полученные с сервера
                console.log(`📡 [NotificationAPI] Получено с сервера: ${response.data.notifications.length} уведомлений`);
                console.log(`📡 [NotificationAPI] Валидных после фильтрации: ${uniqueNotifications.length} уведомлений`);
                console.log(`📡 [NotificationAPI] Версия данных: ${respVersion}`);
                console.log(`📡 [NotificationAPI] Та же версия: ${sameVersion}`);

                return {
                    data: uniqueNotifications,
                    version: respVersion,
                    changed: !sameVersion,  // changed только если версия изменилась
                    requestId
                };
            } catch (error) {
                console.error('Error fetching notifications:', error);
                
                // Если это ошибка отмены запроса, возвращаем пустой результат
                if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                    return {
                        data: [],
                        version: version || '0',
                        changed: false,
                        requestId
                    };
                }
                
                throw error;
            } finally {
                currentRequest = null;
            }
        })();

        return await currentRequest;
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
