import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { editorsAPI } from '../../api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import '../styles/ModalErrorReport.css';

const ModalErrorReport = ({ 
    show, 
    onHide, 
    bookId, 
    chapterId, 
    bookTitle, 
    chapterTitle, 
    selectedText 
}) => {
    const [suggestion, setSuggestion] = useState('');
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (show) {
            console.log('Opening error report modal with data:', {
                bookId,
                chapterId,
                bookTitle,
                chapterTitle,
                selectedText
            });
        }
    }, [show, bookId, chapterId, bookTitle, chapterTitle, selectedText]);

    const handleSubmit = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
        }
        try {
            if (!bookId || !chapterId) {
                toast.error('Помилка: відсутні необхідні дані', {
                    autoClose: 10000
                });
                return;
            }

            const bookIdNum = parseInt(bookId);
            const chapterIdNum = parseInt(chapterId);

            if (isNaN(bookIdNum) || isNaN(chapterIdNum)) {
                toast.error('Помилка: некоректні ID книги або глави', {
                    autoClose: 10000
                });
                return;
            }

            const response = await editorsAPI.createErrorReport({
                book: bookIdNum,
                chapter: chapterIdNum,
                error_text: selectedText,
                suggestion,
                user_username: user?.username,
                book_title: bookTitle,
                chapter_title: chapterTitle
            });
            
            toast.success('Повідомлення про помилку успішно відправлено', {
                autoClose: 5000
            });
            onHide();
            setSuggestion('');
        } catch (error) {
            if (error.message === 'NO_OWNER') {
                toast.error(
                    'Вибачаємось, але на даний момент у книги немає перекладача, ' +
                    'тому повідомити про помилку ви не можете. Нагадуємо, якщо ви ' +
                    'хочете перекладати даний твір, ви можете подати заявку аби ' +
                    'стати перекладачем цього твору (кнопка "Попросити переклад" ' +
                    'на сторінці перекладу).', 
                    {
                        autoClose: 15000,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        closeButton: true
                    }
                );
            } else {
                toast.error('Помилка при відправці повідомлення', {
                    autoClose: 5000
                });
            }
        }
    }, [bookId, chapterId, selectedText, suggestion, user?.username, bookTitle, chapterTitle, onHide]);

    const handleChange = useCallback((e) => {
        setSuggestion(e.target.value);
    }, []);

    return (
        <Modal
            isOpen={show}
            onRequestClose={onHide}
            className="error-report-modal"
            overlayClassName="error-report-modal__overlay"
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className="error-report-modal__container">
                <h2 className="error-report-modal__title">Повідомлення про помилку</h2>
                <form className="error-report-modal__form" onSubmit={handleSubmit}>
                    <div className="error-report-modal__input-group">
                        <label>Назва книги</label>
                        <input
                            type="text"
                            className="error-report-modal__input"
                            value={bookTitle}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Назва розділу</label>
                        <input
                            type="text"
                            className="error-report-modal__input"
                            value={chapterTitle}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Текст помилки</label>
                        <textarea
                            className="error-report-modal__input"
                            value={selectedText}
                            disabled
                        />
                    </div>
                    <div className="error-report-modal__input-group">
                        <label>Пропозиція</label>
                        <textarea
                            className="error-report-modal__input"
                            value={suggestion}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        className="error-report-modal__submit"
                        type="submit"
                    >
                        Відправити
                    </button>
                </form>
                <button className="error-report-modal__close" onClick={onHide}>
                    ✕
                </button>
            </div>
        </Modal>
    );
};

export default ModalErrorReport;