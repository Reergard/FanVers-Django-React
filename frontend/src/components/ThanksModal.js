import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './styles/ConfirmationModal.css';

const ThanksModal = ({ 
  isOpen, 
  onRequestClose, 
  onConfirm, 
  bookTitle = '',
  isSubmitting = false
}) => {
  const [thanksAmount, setThanksAmount] = useState('');
  const [thanksMessage, setThanksMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setThanksAmount('');
      setThanksMessage('');
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleThanksSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    const amount = parseFloat(thanksAmount);
    
    // Валидация суммы
    if (!thanksAmount || isNaN(amount)) {
      errors.amount = 'Будь ласка, введіть коректну суму';
    } else if (amount < 10) {
      errors.amount = 'Мінімальна сума подяки: 10 FanCoins';
    } else if (amount > 10000) {
      errors.amount = 'Максимальна сума подяки: 10,000 FanCoins';
    }
    
    // Валидация сообщения
    if (thanksMessage && thanksMessage.length > 500) {
      errors.message = 'Повідомлення не може перевищувати 500 символів';
    }
    
    // Дополнительная валидация на специальные символы
    if (thanksMessage && /[<>\"'&]/.test(thanksMessage)) {
      errors.message = 'Повідомлення містить заборонені символи';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await onConfirm({
        amount: amount,
        message: thanksMessage.trim()
      });
      setThanksAmount('');
      setThanksMessage('');
      setValidationErrors({});
      onRequestClose();
    } catch (error) {
      console.error('Error in thanks submission:', error);
      // Ошибка уже обработана в родительском компоненте
    }
  };

  const handleClose = () => {
    setThanksAmount('');
    setThanksMessage('');
    setValidationErrors({});
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
          Подяка авторові
        </h2>
        
        <p className="confirmation-message">
          У вас є окрема можливість Подякувати авторові/перекладачеві та підтримати його роботу.
          <br />
          Виберіть сумму якою хочете Подякувати:
        </p>
        
        <form onSubmit={handleThanksSubmit} className="confirmation-form">
          <div className="form-group">
            <label htmlFor="thanksAmount" className="form-label">
              Сума подяки (FanCoins):
            </label>
            <input
              type="number"
              id="thanksAmount"
              value={thanksAmount}
              onChange={(e) => {
                setThanksAmount(e.target.value);
                if (validationErrors.amount) {
                  setValidationErrors(prev => ({ ...prev, amount: '' }));
                }
              }}
              className={`form-input ${validationErrors.amount ? 'error' : ''}`}
              placeholder="Введіть суму"
              min="10"
              max="10000"
              step="0.01"
              disabled={isSubmitting}
              required
              autoFocus
            />
            {validationErrors.amount && (
              <small className="form-error" style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                {validationErrors.amount}
              </small>
            )}
                        <small className="form-help">
                          Мінімальна сумма 10 FanCoins
                        </small>
          </div>

          <div className="form-group">
            <label htmlFor="thanksMessage" className="form-label">
              Повідомлення (необов'язково):
            </label>
            <textarea
              id="thanksMessage"
              value={thanksMessage}
              onChange={(e) => {
                setThanksMessage(e.target.value);
                if (validationErrors.message) {
                  setValidationErrors(prev => ({ ...prev, message: '' }));
                }
              }}
              className={`form-input ${validationErrors.message ? 'error' : ''}`}
              placeholder="Напишіть повідомлення автору..."
              maxLength="500"
              rows="3"
              disabled={isSubmitting}
            />
            {validationErrors.message && (
              <small className="form-error" style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                {validationErrors.message}
              </small>
            )}
            <small className="form-help">
              Максимум 500 символів ({thanksMessage.length}/500)
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
              disabled={isSubmitting || !thanksAmount || parseFloat(thanksAmount) < 10}
            >
              {isSubmitting ? 'Відправка...' : 'Подякувати'}
            </button>
          </div>
        </form>
        
        <button className="auth-modal__close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </Modal>
  );
};

export default ThanksModal;
