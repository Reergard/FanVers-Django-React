import React from 'react';
import Modal from 'react-modal';
import './styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
  const handleConfirm = async () => {
    await onConfirm();
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="auth-modal"
      overlayClassName="auth-modal__overlay"
      ariaHideApp={false}
    >
      <div className="auth-modal__container">
        <h2 className="auth-modal__title">Підтвердження</h2>
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <button
            onClick={handleConfirm}
            className="auth-modal__submit confirmation-btn confirm"
          >
            Так
          </button>
          <button
            onClick={onRequestClose}
            className="auth-modal__submit confirmation-btn cancel"
          >
            Ні
          </button>
        </div>
        <button className="auth-modal__close" onClick={onRequestClose}>
          ✕
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal; 