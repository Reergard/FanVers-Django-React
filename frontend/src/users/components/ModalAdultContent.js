import React from 'react';
import Modal from 'react-modal';
import '../styles/ModalAdultContent.css';

Modal.setAppElement('#root');

const ModalAdultContent = ({ show, onHide, onConfirm }) => {
    return (
        <Modal
            isOpen={show}
            onRequestClose={onHide}
            className="balance-modal"
            overlayClassName="balance-modal__overlay"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            contentLabel="Приховати контент 18+"
        >
            <div className="balance-modal__container">
                <h2 className="balance-modal__title">Приховати контент 18+</h2>
                <div className="balance-modal__content">
                    <p>
                        Увага! Вибравши цей пунк, ви приховаєте всі книги 18+, 
                        у результаті чого зменшиться кількість контенту який ви зможете бачити.
                    </p>
                    <p>
                        Якщо ви досягнули повноліття, радимо не вмикати обмеження контенту 18+!
                    </p>
                    <p>Ви впевнені що хочете приховати 18+ контент?</p>
                </div>
                <div className="balance-modal__buttons">
                    <button 
                        className="balance-modal__button balance-modal__button--secondary"
                        onClick={onHide}
                        type="button"
                    >
                        Ні
                    </button>
                    <button 
                        className="balance-modal__button balance-modal__button--primary"
                        onClick={onConfirm}
                        type="button"
                    >
                        Так
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalAdultContent;