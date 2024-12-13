import React from 'react';
import Modal from 'react-modal';
import '../styles/ModalBalance.css';

// Устанавливаем корневой элемент один раз вне компонента
Modal.setAppElement('#root');

const ModalWithdrawBalance = ({ show, onHide, amount, setAmount, onSubmit, loading, maxAmount }) => {
    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^\d.]/g, '');
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
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            contentLabel="Виведення коштів"
        >
            <div className="balance-modal__container">
                <h2 className="balance-modal__title">Виведення коштів</h2>
                <div className="balance-modal__form">
                    <div className="balance-modal__input-group">
                        <label>Сума виведення (грн):</label>
                        <input
                            type="number"
                            className="balance-modal__input"
                            value={amount}
                            onChange={handleAmountChange}
                            min="0.01"
                            step="0.01"
                            max={maxAmount}
                        />
                        <small className="balance-modal__hint">
                            Доступно для виведення: {maxAmount} грн
                        </small>
                    </div>
                    <div className="balance-modal__buttons">
                        <button 
                            className="balance-modal__button balance-modal__button--secondary" 
                            onClick={onHide}
                            type="button"
                        >
                            Скасувати
                        </button>
                        <button 
                            className="balance-modal__button balance-modal__button--primary" 
                            onClick={onSubmit}
                            disabled={!amount || loading || Number(amount) > maxAmount}
                            type="button"
                        >
                            {loading ? 'Обробка...' : 'Підтвердити'}
                        </button>
                    </div>
                </div>
                <button 
                    className="balance-modal__close" 
                    onClick={onHide}
                    type="button"
                >
                    ✕
                </button>
            </div>
        </Modal>
    );
};

export default ModalWithdrawBalance; 