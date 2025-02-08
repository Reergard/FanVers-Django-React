import React, { useCallback } from 'react';
import Modal from 'react-modal';
import '../styles/ModalErrorNotification.css';

const ModalErrorNotification = ({ show, onHide, errorReport }) => {
    const handleClose = useCallback(() => {
        if (onHide) onHide();
    }, [onHide]);

    if (!show || !errorReport) return null;

    return (
        <Modal
            isOpen={show}
            onRequestClose={handleClose}
            className="error-report-modal"
            overlayClassName="error-report-modal__overlay"
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            portalClassName={`modal-portal-notification-${errorReport.id}`}
        >
            <div className="error-report-modal__container">
                <h2 className="error-report-modal__title">Повідомлення про помилку</h2>
                <div className="error-report-modal__form">
                    <div className="error-report-modal__input-group">
                        <label>Користувач який повідомляє</label>
                        <input
                            type="text"
                            className="error-report-modal__input"
                            value={errorReport.user_username || ''}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Назва книги</label>
                        <input
                            type="text"
                            className="error-report-modal__input"
                            value={errorReport.book_title || ''}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Назва розділу</label>
                        <input
                            type="text"
                            className="error-report-modal__input"
                            value={errorReport.chapter_title || ''}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Знайдена помилка</label>
                        <textarea
                            className="error-report-modal__input"
                            value={errorReport.error_text || ''}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Пропозиція щодо виправлення</label>
                        <textarea
                            className="error-report-modal__input"
                            value={errorReport.suggestion || ''}
                            disabled
                        />
                    </div>
                </div>
                <button className="error-report-modal__close" onClick={handleClose}>
                    ✕
                </button>
            </div>
        </Modal>
    );
};

export default ModalErrorNotification;
