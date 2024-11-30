import React, { useState, memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { editorsAPI } from '../../api';
import { deleteNotification } from '../notificationSlice';
import { toast } from 'react-toastify';
import ModalErrorNotification from './ModalErrorNotification';
import '../styles/NotificationItem.css';

const NotificationItem = memo(({ notification, onMarkAsRead }) => {
    const dispatch = useDispatch();
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorReport, setErrorReport] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDelete = useCallback(async () => {
        try {
            setIsDeleting(true);
            await dispatch(deleteNotification(notification.id)).unwrap();
            toast.success('Повідомлення видалено');
        } catch (error) {
            toast.error('Помилка при видаленні повідомлення');
        } finally {
            setIsDeleting(false);
        }
    }, [dispatch, notification.id]);

    return (
        <div className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
            <div className="notification-content">
                {renderMessage()}
                <small>{new Date(notification.created_at).toLocaleString()}</small>
            </div>

            <div className="notification-actions">
                {!notification.is_read && (
                    <button 
                        onClick={() => onMarkAsRead(notification.id)}
                        className="mark-read-button"
                        disabled={isDeleting}
                    >
                        Позначити як прочитане
                    </button>
                )}
                <button 
                    onClick={handleDelete}
                    className="delete-button"
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Видалення...' : 'Видалити'}
                </button>
            </div>

            {showErrorModal && errorReport && (
                <ModalErrorNotification
                    show={showErrorModal}
                    onHide={handleCloseModal}
                    errorReport={errorReport}
                />
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.notification.id === nextProps.notification.id && 
           prevProps.notification.is_read === nextProps.notification.is_read;
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
