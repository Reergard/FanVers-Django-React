import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './styles/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onRequestClose, 
  onConfirm, 
  message, 
  type = 'confirmation', // 'confirmation' or 'form'
  formData = null, // для формы создания тома
  bookTitle = ''
}) => {
  const [formTitle, setFormTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen && type === 'form') {
      setFormTitle('');
      setIsSubmitting(false);
    }
  }, [isOpen, type]);

  const handleConfirm = async () => {
    if (type === 'form') {
      return; // Для формы используем handleFormSubmit
    }
    await onConfirm();
    onRequestClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formTitle.trim()) {
      return;
    }

    if (formTitle.trim().length < 2) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm(formTitle.trim());
      setFormTitle('');
      onRequestClose();
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormTitle('');
    setIsSubmitting(false);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="auth-modal"
      overlayClassName="auth-modal__overlay"
      ariaHideApp={false}
    >
      <div className="auth-modal__container">
        <h2 className="auth-modal__title">
          {type === 'form' ? 'Створити том' : 'Підтвердження'}
        </h2>
        
        {type === 'form' ? (
          <>
            <p className="confirmation-message">
              Створення нового тому для "{bookTitle}"
            </p>
            
            <form onSubmit={handleFormSubmit} className="confirmation-form">
              <div className="form-group">
                <label htmlFor="volumeTitle" className="form-label">
                  Назва тому:
                </label>
                <input
                  type="text"
                  id="volumeTitle"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-input"
                  placeholder="Введіть назву тому"
                  maxLength={255}
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
                <small className="form-help">
                  Мінімум 2 символи, максимум 255 символів
                </small>
              </div>

              <div className="confirmation-buttons">
                <button
                  type="button"
                  onClick={handleClose}
                  className="auth-modal__submit confirmation-btn cancel"
                  disabled={isSubmitting}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="auth-modal__submit confirmation-btn confirm"
                  disabled={isSubmitting || !formTitle.trim()}
                >
                  {isSubmitting ? 'Створення...' : 'Створити том'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="confirmation-message">{message}</p>
            <div className="confirmation-buttons">
              <button
                onClick={handleConfirm}
                className="auth-modal__submit confirmation-btn confirm"
              >
                Так
              </button>
              <button
                onClick={handleClose}
                className="auth-modal__submit confirmation-btn cancel"
              >
                Ні
              </button>
            </div>
          </>
        )}
        
        <button className="auth-modal__close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal; 
