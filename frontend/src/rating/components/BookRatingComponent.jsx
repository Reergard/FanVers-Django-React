import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { fetchBookRatings, submitRating } from '../../api/rating/ratingAPI';
import { useToast } from '../../components/CustomToast';
import { requestThrottle, createRequestKey } from '../utils/requestThrottle';
import { retryWithBackoff } from '../../utils/retryUtils';
import StarLightOff from '../../components/images/Star_light_off.svg';
import StarFillOn from '../../components/images/Star_fill_on.svg';
import StarLightMidl from '../../components/images/Star_fill_midl.svg';
import styles from '../../catalog/css/BookDetailRouter.module.css';
import ratingStyles from '../styles/BookRatingComponent.module.css';

const BookRatingComponent = ({ bookSlug, ratingType, title, onRatingUpdate, compact = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentUser = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');
  const { error: showError, warning } = useToast();

  const loadRatings = useCallback(async () => {
    if (!bookSlug) return;
    
    const requestKey = createRequestKey(bookSlug, ratingType, 'fetch');
    
    return requestThrottle.addRequest(requestKey, async () => {
      try {
        setIsLoading(true);
        console.log(`Загрузка рейтингов для книги: ${bookSlug}, тип: ${ratingType}`);
        
        // Добавляем небольшую задержку для предотвращения одновременных запросов
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const ratingsData = await retryWithBackoff(
          () => fetchBookRatings(bookSlug, token),
          2, // максимум 2 повторные попытки
          1000 // базовая задержка 1 секунда
        );
        
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
        
        // Обработка ошибки 429 (Too Many Requests) - теперь обрабатывается в retryWithBackoff
        if (error.response?.status === 429) {
          console.log('Rate limit exceeded, will retry automatically');
          return;
        }
        
        showError('Помилка завантаження рейтингу');
      } finally {
        setIsLoading(false);
      }
    });
  }, [bookSlug, ratingType, token, showError]);

  // Загружаем рейтинги при монтировании компонента и при изменении bookSlug
  useEffect(() => {
    if (bookSlug) {
      // Сбрасываем состояние при смене книги
      setRating(0);
      setAverageRating(0);
      setTotalVotes(0);
      setHoverRating(0);
      
      // Добавляем задержку для рейтинга перевода, чтобы избежать одновременных запросов
      const delay = ratingType === 'TRANSLATION' ? 200 : 0;
      setTimeout(() => {
        loadRatings();
      }, delay);
    }
  }, [bookSlug, ratingType, loadRatings]);

  const handleRatingClick = async (selectedRating) => {
    if (!currentUser || !token) {
      warning('Для голосування необхідно увійти в систему');
      return;
    }

    const requestKey = createRequestKey(bookSlug, ratingType, 'submit');
    
    return requestThrottle.addRequest(requestKey, async () => {
      try {
        setIsLoading(true);
        
        await retryWithBackoff(
          () => submitRating(bookSlug, ratingType, selectedRating, token),
          2, // максимум 2 повторные попытки
          1000 // базовая задержка 1 секунда
        );
        
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
        
        // Обработка ошибки 429 (Too Many Requests) - теперь обрабатывается в retryWithBackoff
        if (error.response?.status === 429) {
          console.log('Rate limit exceeded for rating submission, will retry automatically');
          return;
        }
        
        showError(error.message || 'Помилка при голосуванні');
      } finally {
        setIsLoading(false);
      }
    });
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

  // Компактный режим для карусели
  if (compact) {
    return (
      <div className={ratingStyles.compactContainer}>
        <div className={ratingStyles.compactInnerContainer}>
          <div className={ratingStyles.starsContainer}>
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <img
                key={starIndex}
                src={getStarImage(starIndex)}
                alt={getStarAlt(starIndex)}
                onClick={() => handleRatingClick(starIndex + 1)}
                onMouseEnter={() => handleMouseEnter(starIndex)}
                onMouseLeave={handleMouseLeave}
                className={`${ratingStyles.star} ${!currentUser ? ratingStyles.starDisabled : ''}`}
                title={currentUser ? `Оцінити на ${starIndex + 1} зірок` : 'Увійдіть для голосування'}
              />
            ))}
          </div>
          {totalVotes > 0 && (
            <span className={ratingStyles.ratingText}>
              {averageRating.toFixed(1)} ({totalVotes})
            </span>
          )}
        </div>
      </div>
    );
  }

  // Обычный режим для страниц книг
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

export default BookRatingComponent;
