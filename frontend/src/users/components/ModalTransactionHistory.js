import React from 'react';
import Modal from 'react-modal';
import '../styles/ModalBalance.css';

Modal.setAppElement('#root');

const ModalTransactionHistory = ({ show, onHide, balanceHistory }) => {
    return (
        <Modal
            isOpen={show}
            onRequestClose={onHide}
            className="balance-modal"
            overlayClassName="balance-modal__overlay"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            contentLabel="Історія транзакцій"
        >
            <div className="balance-modal__container">
                <h2 className="balance-modal__title">Історія транзакцій</h2>
                <div className="balance-modal__content">
                    {balanceHistory.length > 0 ? (
                        <div className="balance-history-list">
                            {balanceHistory.map((operation, index) => (
                                <div key={index} className="operation-item">
                                    <span className="operation-type">
                                        {operation.operation_type === 'deposit' ? 'Поповнення' : 
                                         operation.operation_type === 'withdraw' ? 'Виведення' : 
                                         'Покупка'}
                                    </span>
                                    <span className="operation-amount">
                                        {operation.operation_type === 'deposit' ? '+' : '-'}
                                        {operation.amount} грн
                                    </span>
                                    <span className="operation-date">
                                        {new Date(operation.created_at).toLocaleDateString()}
                                    </span>
                                    <span className={`operation-status ${operation.status}`}>
                                        {operation.status === 'completed' ? 'Виконано' : 'Помилка'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="balance-modal__empty">Історія транзакцій порожня</p>
                    )}
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

export default ModalTransactionHistory; 