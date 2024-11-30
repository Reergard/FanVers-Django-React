import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../notificationSlice';
import NotificationItem from '../components/NotificationItem';
import '../styles/NotificationPage.css';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const { notifications, loading, error } = useSelector(state => state.notification);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
        } catch (error) {
            toast.error('Помилка при позначенні повідомлення як прочитаного');
        }
    }, [dispatch]);

    const debouncedFetch = useCallback(
        debounce(() => {
            dispatch(fetchNotifications());
        }, 300),
        [dispatch]
    );

    useEffect(() => {
        let intervalId;
        
        const initFetch = () => {
            debouncedFetch();
            intervalId = setInterval(debouncedFetch, 30000);
        };

        initFetch();

        return () => {
            if (intervalId) clearInterval(intervalId);
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    if (loading && notifications.length === 0) {
        return <div className="notifications-loading">Завантаження...</div>;
    }

    if (error) {
        return <div className="notifications-error">{error}</div>;
    }

    return (
        <div className="notifications-page">
            <h1>Повідомлення</h1>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">Немає нових повідомлень</p>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={`notification-${notification.id}`}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPage;