import React, { useState, useEffect } from 'react';
import { fetchRating, postRating } from '../api/rating/ratingAPI';
import './RatingBar.css';

const RatingBar = ({ bookSlug }) => {
  const [rating, setRating] = useState(0); // Средний рейтинг книги
  const [hoverRating, setHoverRating] = useState(null); // Текущая оценка при наведении
  const [userRating, setUserRating] = useState(null); // Оценка пользователя
  const [showStars, setShowStars] = useState(false); // Состояние для показа звезд

  useEffect(() => {
    const loadRating = async () => {
      const data = await fetchRating(bookSlug);
      if (data?.average_score) {
        setRating(data.average_score);
      }

      // Обновляем userRating, только если он не null или undefined
      if (data?.user_rating !== null && data?.user_rating !== undefined) {
        setUserRating(data.user_rating);
      }
    };

    loadRating();
  }, [bookSlug]);

  const handleRatingClick = async (score) => {
    try {
      await postRating(bookSlug, score); // Просто передаем slug и оценку, токен извлекается внутри
      setUserRating(score); // Устанавливаем оценку пользователя после успешного поста
      alert('Ваш рейтинг был отправлен!');
    } catch (error) {
      alert('Ошибка при отправке рейтинга. Пожалуйста, войдите в систему.');
    }
  };

  return (
    <div
      className="rating-bar-container"
      // Показывать звезды при наведении, только если пользователь еще не оставил свою оценку
      onMouseEnter={() => { if (!userRating) setShowStars(true); }}
      onMouseLeave={() => setShowStars(false)}
    >
      {/* Если у пользователя уже есть оценка, показываем только шкалу, без звезд */}
      {userRating !== null ? (
        <div className="rating-bar">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`rating-segment ${i < rating ? 'filled' : ''}`}
            />
          ))}
        </div>
      ) : (
        // Если пользователь еще не оставлял оценку
        (!showStars ? (
          <div className="rating-bar">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`rating-segment ${i < rating ? 'filled' : ''}`}
              />
            ))}
          </div>
        ) : (
          <div className="rating-stars">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`star ${i < (hoverRating ?? userRating ?? rating) ? 'filled' : ''}`}
                onMouseEnter={() => setHoverRating(i + 1)} // Подсвечиваем звезды при наведении
                onClick={() => handleRatingClick(i + 1)} // Устанавливаем рейтинг при клике
              >
                ★
              </span>
            ))}
          </div>
        ))
      )}
      <span className="rating-percentage">{(rating * 10).toFixed(1)}%</span>
    </div>
  );
};

export default RatingBar;
