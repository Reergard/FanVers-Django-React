import React, { useEffect, useState, useCallback, useRef } from 'react';
import { notificationAPI } from '../../api';
import NotificationItem from '../components/NotificationItem';
import '../styles/NotificationPage.css';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const currentRequestId = useRef(0);

    const fetchNotifications = async () => {
        const requestId = ++currentRequestId.current;
        
        try {
            const response = await notificationAPI.getNotifications(version);
            
            if (!response) return;
            
            if (requestId !== currentRequestId.current) return;

            if (response.version > version) {
                setVersion(response.version);
                setNotifications(prev => {
                    const uniqueNotifications = [...new Map(
                        (response.data || []).map(item => [item.id, item])
                    ).values()];
                    return uniqueNotifications;
                });
            }
            
            setError(null);
            setLoading(false);
            
        } catch (error) {
            setError(error.message || 'Произошла ошибка при загрузке уведомлений');
            setLoading(false);
        }
    };

    const handleMarkAsRead = useCallback(async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev => {
                const updated = prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, is_read: true }
                        : notification
                );
                return updated;
            });
        } catch (error) {
            toast.error('Помилка при позначенні повідомлення як прочитаного');
        }
    }, []);

    const debouncedFetch = useCallback(
        debounce(async () => {
            await fetchNotifications();
        }, 300),
        []
    );

    useEffect(() => {
        let intervalId;
        
        const initFetch = async () => {
            await debouncedFetch();
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