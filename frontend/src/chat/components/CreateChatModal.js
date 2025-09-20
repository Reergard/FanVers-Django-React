import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../css/CreateChatModal.css';

const CreateChatModal = ({ onClose, onCreateChat }) => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        
        setIsSubmitting(true);
        try {
            await onCreateChat(username, message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ConfirmationModal
            isOpen={true}
            onRequestClose={onClose}
            onConfirm={handleSubmit}
            message=""
            type="chat"
            formData={{ username, message }}
            bookTitle=""
        >
            <div className="create-chat-form">
                <div className="form-group">
                    <label htmlFor="username">Ім'я користувача:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введіть ім'я користувача"
                        required
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                    />
                </div>
            </div>
        </ConfirmationModal>
    );
};

export default CreateChatModal;