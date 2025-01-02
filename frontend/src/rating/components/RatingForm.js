import React, { useState } from 'react';
import useBookAnalytics from '../../hooks/useBookAnalytics';
import '../styles/RatingForm.css';

const RatingForm = ({ bookId, type, onSubmit }) => {
    const [selectedRating, setSelectedRating] = useState(0);
    const { trackBookRating, trackTranslationRating } = useBookAnalytics();

    const handleRatingSubmit = async (rating) => {
        setSelectedRating(rating);
        await onSubmit(rating);
        if (type === 'book') {
            trackBookRating(bookId);
        } else if (type === 'translation') {
            trackTranslationRating(bookId);
        }
    };

    return (
        <div className="rating-form">
            <h3>{type === 'book' ? 'Оцінка книги' : 'Оцінка перекладу'}</h3>
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRatingSubmit(star)}
                        className={`star-button ${star <= selectedRating ? 'active' : ''}`}
                        type="button"
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RatingForm; 