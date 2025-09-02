import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchBookRatings, submitRating } from '../../api/rating/ratingAPI';
import { useToast } from '../../components/CustomToast';
import StarLightOff from '../../components/images/Star_light_off.svg';
import StarFillOn from '../../components/images/Star_fill_on.svg';
import StarLightMidl from '../../components/images/Star_fill_midl.svg';
import styles from '../css/BookDetailRouter.module.css';

const BookRating = ({ bookSlug, ratingType, title, onRatingUpdate }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentUser = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');
  const { error: showError, warning } = useToast();

  // Загружаем рейтинги при монтировании компонента
  useEffect(() => {
    if (bookSlug) {
      loadRatings();
    }
  }, [bookSlug]);

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      
      const ratingsData = await fetchBookRatings(bookSlug, token);
      
      if (ratingType === 'BOOK') {
        setAverageRating(ratingsData.book_rating.average || 0);
        setTotalVotes(ratingsData.book_rating.total_votes || 0);
        
        // Устанавливаем пользовательский рейтинг если есть
        if (ratingsData.user_ratings) {
          const userRating = ratingsData.user_ratings.find(r => r.rating_type === 'BOOK');
          if (userRating) {
            setRating(userRating.rating);
          }
        }
      } else if (ratingType === 'TRANSLATION') {
        setAverageRating(ratingsData.translation_rating.average || 0);
        setTotalVotes(ratingsData.translation_rating.total_votes || 0);
        
        // Устанавливаем пользовательский рейтинг если есть
        if (ratingsData.user_ratings) {
          const userRating = ratingsData.user_ratings.find(r => r.rating_type === 'TRANSLATION');
          if (userRating) {
            setRating(userRating.rating);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      showError('Помилка завантаження рейтингу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingClick = async (selectedRating) => {
    if (!currentUser || !token) {
      warning('Для голосування необхідно увійти в систему');
      return;
    }

    try {
      setIsLoading(true);
      
      await submitRating(bookSlug, ratingType, selectedRating, token);
      
      // Обновляем локальное состояние
      setRating(selectedRating);
      
      // Перезагружаем рейтинги для получения обновленной средней оценки
      await loadRatings();
      
      // Уведомляем родительский компонент об обновлении
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError(error.message || 'Помилка при голосуванні');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = (starIndex) => {
    setHoverRating(starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const getStarImage = (starIndex) => {
    const starNumber = starIndex + 1;
    
    // Если пользователь навел мышь, показываем предварительный рейтинг
    if (hoverRating >= starNumber) {
      return StarFillOn;
    }
    
    // Если у пользователя есть оценка, показываем её
    if (rating >= starNumber) {
      return StarFillOn;
    }
    
    // Если есть средняя оценка, показываем её
    if (averageRating >= starNumber) {
      return StarLightMidl;
    }
    
    // Иначе неактивная звезда
    return StarLightOff;
  };

  const getStarAlt = (starIndex) => {
    const starNumber = starIndex + 1;
    
    if (hoverRating >= starNumber) {
      return `Оцінити на ${starNumber} зірок`;
    }
    
    if (rating >= starNumber) {
      return `Ваша оцінка: ${starNumber} зірок`;
    }
    
    if (averageRating >= starNumber) {
      return `Середня оцінка: ${starNumber} зірок`;
    }
    
    return `${starNumber} зірок`;
  };

  if (isLoading) {
    return (
      <div className={styles.raitingBook}>
        <span>{title}:</span>
        <div className={styles.stars}>
          <span>Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.raitingBook}>
      <span>{title}:</span>
             <div className={styles.stars}>
         <div className={styles['stars-row']}>
           {[0, 1, 2, 3, 4].map((starIndex) => (
             <img
               key={starIndex}
               src={getStarImage(starIndex)}
               alt={getStarAlt(starIndex)}
               className={styles.starRating}
               onClick={() => handleRatingClick(starIndex + 1)}
               onMouseEnter={() => handleMouseEnter(starIndex)}
               onMouseLeave={handleMouseLeave}
               style={{ 
                 cursor: currentUser ? 'pointer' : 'default',
                 opacity: currentUser ? 1 : 0.7
               }}
               title={currentUser ? `Оцінити на ${starIndex + 1} зірок` : 'Увійдіть для голосування'}
             />
           ))}
         </div>
         {totalVotes > 0 && (
           <span className={styles.ratingInfo}>
             ({averageRating.toFixed(1)} / {totalVotes} голосів)
           </span>
         )}
       </div>
    </div>
  );
};

export default BookRating;
