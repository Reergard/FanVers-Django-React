import React, { useState } from 'react';
import useBookAnalytics from '../../hooks/useBookAnalytics';

const CommentForm = ({ onSubmit, initialText = '', readOnlyInitialText = false, bookId }) => {
    const [text, setText] = useState(initialText);
    const { trackComment } = useBookAnalytics();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.trim()) {
            await onSubmit(text);
            if (bookId) {
                trackComment(bookId);
            }
            setText('');
        }
    };

    const handleTextChange = (e) => {
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
                value={text}
                onChange={handleTextChange}
                placeholder="Напишите ваш комментарий..."
                rows="4"
            />
            <button type="submit">Отправить</button>
        </form>
    );
};

export default CommentForm;
