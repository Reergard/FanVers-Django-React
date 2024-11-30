import React from 'react';
import Modal from 'react-modal';
import '../styles/ModalBalance.css';

const ModalWithdrawBalance = ({ show, onHide, amount, setAmount, onSubmit, loading, maxAmount }) => {
    if (!show) return null;

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
                <h2 className="balance-modal__title">Виведення коштів</h2>
                <div className="balance-modal__form">
                    <div className="balance-modal__input-group">
                        <label>Сума виведення (грн):</label>
                        <input
                            type="number"
                            className="balance-modal__input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
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
                        >
                            Скасувати
                        </button>
                        <button 
                            className="balance-modal__button balance-modal__button--primary" 
                            onClick={onSubmit}
                            disabled={!amount || loading || Number(amount) > maxAmount}
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

export default ModalWithdrawBalance; 