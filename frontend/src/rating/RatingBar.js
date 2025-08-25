import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchBookRatings, submitRating } from '../api/rating/ratingAPI';
import { toast } from 'react-toastify';
import useBookAnalytics from '../hooks/useBookAnalytics';
import './styles/RatingBar.css';

const RatingBar = ({ bookSlug }) => {
    const queryClient = useQueryClient();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const token = localStorage.getItem('token');
    const { trackBookRating, trackTranslationRating } = useBookAnalytics();

    const { data: ratings, isLoading, error } = useQuery({
        queryKey: ['bookRatings', bookSlug],
        queryFn: () => fetchBookRatings(bookSlug, token),
        retry: 1
    });

    const ratingMutation = useMutation({
        mutationFn: ({ ratingType, rating }) => 
            submitRating(bookSlug, ratingType, rating, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['bookRatings', bookSlug]);
            toast.success('Оцінка успішно збережена');
        },
        onError: (error) => {
            toast.error('Помилка при збереженні оцінки: ' + error.message);
        }
    });

    const [hoverRating, setHoverRating] = useState({ BOOK: 0, TRANSLATION: 0 });

    const handleRating = async (ratingType, rating) => {
        if (!isAuthenticated) {
            toast.warning('Будь ласка, увійдіть для оцінювання');
            return;
        }
        if (ratingMutation.isLoading) return;
        
        console.log('Попытка добавления рейтинга:', { ratingType, rating, bookSlug });
        
        try {
            if (ratingType === 'BOOK') {
                console.log('Отправка данных в аналитику для рейтинга книги');
                await trackBookRating(bookSlug);
                console.log('Аналитика рейтинга книги обновлена');
            } else if (ratingType === 'TRANSLATION') {
                console.log('Отправка данных в аналитику для рейтинга перевода');
                await trackTranslationRating(bookSlug);
                console.log('Аналитика рейтинга перевода обновлена');
            }
            
            await ratingMutation.mutateAsync({ ratingType, rating });
            console.log('Рейтинг успешно сохранен');
        } catch (error) {
            console.error('Ошибка при сохранении рейтинга:', error);
            toast.error('Помилка при збереженні оцінки: ' + error.message);
        }
    };

    const renderStars = (rating, ratingType, userRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${
                        i <= (hoverRating[ratingType] || rating) ? 'filled' : ''
                    } ${
                        userRating && i <= userRating ? 'user-rated' : ''
                    }`}
                    onClick={() => handleRating(ratingType, i)}
                    onMouseEnter={() => setHoverRating(prev => ({ 
                        ...prev, 
                        [ratingType]: i 
                    }))}
                    onMouseLeave={() => setHoverRating(prev => ({ 
                        ...prev, 
                        [ratingType]: 0 
                    }))}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (isLoading) return <div>Завантаження...</div>;
    if (error) return <div>Помилка: {error.message}</div>;

    const bookUserRating = ratings?.user_ratings?.find(
        r => r.rating_type === 'BOOK'
    )?.rating;
    const translationUserRating = ratings?.user_ratings?.find(
        r => r.rating_type === 'TRANSLATION'
    )?.rating;

    return (
        <div className="rating-container">
            <div className="rating-block">
                <h3>Рейтінг книги</h3>
                <div className="stars">
                    {renderStars(
                        ratings?.book_rating?.average || 0, 
                        'BOOK', 
                        bookUserRating
                    )}
                </div>
                <span className="rating-value">
                    {ratings?.book_rating?.average ? 
                        ratings.book_rating.average.toFixed(1) : '0'}/5
                    <span className="votes-count">
                        ({ratings?.book_rating?.total_votes || 0})
                    </span>
                </span>
            </div>

            <div className="rating-block">
                <h3>Рейтінг перекладу</h3>
                <div className="stars">
                    {renderStars(
                        ratings?.translation_rating?.average || 0, 
                        'TRANSLATION', 
                        translationUserRating
                    )}
                </div>
                <span className="rating-value">
                    {ratings?.translation_rating?.average ? 
                        ratings.translation_rating.average.toFixed(1) : '0'}/5
                    <span className="votes-count">
                        ({ratings?.translation_rating?.total_votes || 0})
                    </span>
                </span>
            </div>
            {ratingMutation.isLoading && (
                <div className="rating-loading">Збереження оцінки...</div>
            )}
        </div>
    );
};

export default RatingBar; 