import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { editorsAPI } from '../../api';
import { useToast } from '../../components/CustomToast';
import '../styles/ModalErrorReport.css';

const ModalErrorReport = ({ show, onHide, bookId, chapterId, bookTitle, chapterTitle, selectedText }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      if (!bookId || !chapterId) {
        showError('Помилка: відсутні необхідні дані');
        return;
      }

      const bookIdNum = parseInt(bookId);
      const chapterIdNum = parseInt(chapterId);

      if (isNaN(bookIdNum) || isNaN(chapterIdNum)) {
        showError('Помилка: некоректні ID книги або глави');
        return;
      }

      const response = await editorsAPI.createErrorReport({
        book: bookIdNum,
        chapter: chapterIdNum,
        error_text: selectedText,
        suggestion,
        book_title: bookTitle,
        chapter_title: chapterTitle
      });
      
      success('Повідомлення про помилку успішно відправлено');
      onHide();
      setSuggestion('');
    } catch (error) {
      if (error.message === 'NO_OWNER') {
        showError(
          'Вибачаємось, але на даний момент у книги немає перекладача, ' +
          'тому повідомити про помилку ви не можете. Нагадуємо, якщо ви ' +
          'хочете перекладати даний твір, ви можете подати заявку аби ' +
          'стати перекладачем цього твору (кнопка "Попросити переклад" ' +
          'на сторінці перекладу).'
        );
      } else {
        showError('Помилка при відправці повідомлення');
      }
    }
  }, [bookId, chapterId, selectedText, suggestion, bookTitle, chapterTitle, onHide, showError, success]);

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