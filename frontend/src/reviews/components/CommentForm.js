import React, { useState } from 'react';

const CommentForm = ({ onSubmit, initialText = '', readOnlyInitialText = false }) => {
    const [text, setText] = useState(initialText);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);  // Передаем только текст
            setText('');  // Очищаем поле после отправки
        }
    };

    const handleTextChange = (e) => {
        // Исправляем логику обновления текста
        if (readOnlyInitialText) {
            setText(e.target.value);
        } else {
            setText(e.target.value);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {readOnlyInitialText && initialText && (
                <div>
                    <p>Ответ на комментарий:</p>
                    <blockquote>{initialText}</blockquote>
                </div>
            )}
            <textarea
                value={text}  // Используем просто text вместо условия
                onChange={handleTextChange}
                placeholder="Напишите ваш комментарий..."
                rows="4"
            />
            <button type="submit">Отправить</button>
        </form>
    );
};

export default CommentForm;
