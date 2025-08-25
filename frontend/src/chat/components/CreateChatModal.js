import React, { useState, useEffect } from 'react';
import '../css/CreateChatModal.css';

const CreateChatModal = ({ onClose, onCreateChat }) => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateChat(username, message);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="create-chat-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Створити новий чат</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Ім\'я користувача:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введіть ім\'я користувача"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Повідомлення:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Введіть повідомлення"
                            rows="4"
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Створити чат
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateChatModal;