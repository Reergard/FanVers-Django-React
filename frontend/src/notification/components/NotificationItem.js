import React, { useState, memo, useCallback } from 'react';
import { editorsAPI } from '../../api';
import { toast } from 'react-toastify';
import ModalErrorNotification from './ModalErrorNotification';
import '../styles/NotificationItem.css';

const NotificationItem = memo(({ notification, onMarkAsRead }) => {
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorReport, setErrorReport] = useState(null);

    const handleErrorReportClick = useCallback(async () => {
        try {
            if (!notification.error_report_id) {
                toast.error('ID звіту про помилку не знайдено');
                return;
            }

            const response = await editorsAPI.getErrorReport(notification.error_report_id);
            if (response.data) {
                setErrorReport(response.data);
                setShowErrorModal(true);
            }
        } catch (error) {
            toast.error('Помилка при завантаженні даних про помилку');
        }
    }, [notification.error_report_id]);

    const handleCloseModal = useCallback(() => {
        setShowErrorModal(false);
        setTimeout(() => {
            setErrorReport(null);
        }, 300);
    }, []);

    const renderMessage = useCallback(() => {
        if (notification.error_report_id) {
            return (
                <p className="notification-message">
                    {`Увага, користувач ${notification.reporter_username} пропонує виправлення у книзі "${notification.book_title}". Для більш детальної інформації натисніть `}
                    <button 
                        onClick={handleErrorReportClick}
                        className="error-report-link"
                    >
                        сюди
                    </button>
                    !
                </p>
            );
        }
        
        return (
            <p className="notification-message">
                {notification.message}
            </p>
        );
    }, [notification, handleErrorReportClick]);

    return (
        <div className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
            <div className="notification-content">
                {renderMessage()}
                <small>{new Date(notification.created_at).toLocaleString()}</small>
            </div>

            {showErrorModal && errorReport && (
                <ModalErrorNotification
                    show={showErrorModal}
                    onHide={handleCloseModal}
                    errorReport={errorReport}
                />
            )}

            {!notification.is_read && (
                <button 
                    onClick={() => onMarkAsRead(notification.id)}
                    className="mark-read-button"
                >
                    Позначити як прочитане
                </button>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.notification.id === nextProps.notification.id && 
           prevProps.notification.is_read === nextProps.notification.is_read;
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
