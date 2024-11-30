import React from 'react';
import Modal from 'react-modal';
import '../styles/ModalBalance.css';

const ModalDepositBalance = ({ show, onHide, amount, setAmount, onSubmit, loading }) => {
    if (!show) return null;

    const handleAmountChange = (e) => {
        // Убираем все нечисловые символы, кроме точки
        const value = e.target.value.replace(/[^\d.]/g, '');
        // Проверяем, что это валидное число
        if (value === '' || !isNaN(value)) {
            setAmount(value);
        }
    };

    return (
        <Modal
            isOpen={show}
            onRequestClose={onHide}
            className="balance-modal"
            overlayClassName="balance-modal__overlay"
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className="balance-modal__container">
                <h2 className="balance-modal__title">Поповнення балансу</h2>
                <div className="balance-modal__form">
                    <div className="balance-modal__input-group">
                        <label>Сума поповнення (грн):</label>
                        <input
                            type="number"
                            className="balance-modal__input"
                            value={amount}
                            onChange={handleAmountChange}
                            min="0.01"
                            step="0.01"
                            placeholder="Введіть суму"
                        />
                    </div>
                    <div className="balance-modal__buttons">
                        <button 
                            className="balance-modal__button balance-modal__button--secondary" 
                            onClick={onHide}
                        >
                            Скасувати
                        </button>
                        <button 
                            className="balance-modal__button balance-modal__button--primary" 
                            onClick={onSubmit}
                            disabled={!amount || parseFloat(amount) <= 0 || loading}
                        >
                            {loading ? 'Обробка...' : 'Підтвердити'}
                        </button>
                    </div>
                </div>
                <button className="balance-modal__close" onClick={onHide}>
                    ✕
                </button>
            </div>
        </Modal>
    );
};

export default ModalDepositBalance; 