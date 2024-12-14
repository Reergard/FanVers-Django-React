import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { usersAPI } from '../../api/users/usersAPI';
import { notificationAPI } from '../../api/notification/notificationAPI';
import { toast } from 'react-toastify';
import "../css/Catalog.css";
import { Container } from 'react-bootstrap';
import RatingBar from '../../rating/RatingBar';
import BookComments from '../../reviews/components/BookComments';
import BookmarkButton from '../../navigation/components/BookmarkButton';
import AdultIcon from '../../assets/images/icons/18+.png';
import { 
    getTranslationStatusLabel, 
    getOriginalStatusLabel,
    getBookTypeLabel 
} from '../utils/bookUtils';

const BookDetailReader = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 2000;
  const lastPurchaseAttemptRef = useRef(null);
  const purchaseInProgressRef = useRef(false);

  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const response = await catalogAPI.getChapterList(slug);
      return response.data;
    },
  });

  const handlePurchaseChapter = async (chapterId) => {
    if (isPurchasing || purchaseInProgressRef.current) {
      toast.warning('Купівля вже в процесі');
      return;
    }

    const now = Date.now();
    if (lastPurchaseAttemptRef.current && 
        now - lastPurchaseAttemptRef.current < INITIAL_RETRY_DELAY) {
      toast.warning('Будь ласка, зачекайте перед наступною спробою');
      return;
    }

    try {
      setIsPurchasing(true);
      purchaseInProgressRef.current = true;
      lastPurchaseAttemptRef.current = now;
      setRetryCount(0);

      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!chapter) {
        throw new Error('Глава не знайдена');
      }

      let lastError = null;
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          const response = await usersAPI.purchaseChapter(chapterId);
          
          // Успешная покупка
          queryClient.invalidateQueries(['chapters', slug]);
          queryClient.invalidateQueries(['profile']);
          
          const notificationData = {
            message: `Ви успішно придбали главу "${chapter.title}" книги "${book?.title}"`,
            book: book.id,
            is_read: false,
            user: currentUser.id,
          };
          
          await notificationAPI.createNotification(notificationData);
          toast.success('Глава успішно придбана');
          navigate(`/books/${slug}/chapters/${chapter.slug}`);
          return; // Выходим из функции при успехе
          
        } catch (error) {
          lastError = error;
          
          if (error.response?.status === 429) {
            attempt++;
            setRetryCount(attempt);
            
            if (attempt < MAX_RETRIES) {
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
              toast.info(`Повторна спроба ${attempt + 1}/${MAX_RETRIES} через ${delay/1000} секунд...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            // Для других ошибок прекращаем попытки
            throw error;
          }
        }
      }

      // Если все попытки исчерпаны
      if (lastError) {
        throw lastError;
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
      if (error.response?.status === 429) {
        toast.error('Перевищено ліміт спроб. Будь ласка, спробуйте пізніше');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Помилка при купівлі глави');
      } else {
        toast.error('Помилка при купівлі глави');
      }
    } finally {
      // Задержка перед сбросом состояния
      setTimeout(() => {
        setIsPurchasing(false);
        purchaseInProgressRef.current = false;
        lastPurchaseAttemptRef.current = null;
        setRetryCount(0);
      }, INITIAL_RETRY_DELAY);
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      setIsPurchasing(false);
      purchaseInProgressRef.current = false;
      lastPurchaseAttemptRef.current = null;
      setRetryCount(0);
    };
  }, []);

  if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;

  return (
    <section className="book-detail">
      <Container fluid className="catalog-section" id="catalog">
        <Container className="catalog-content">
          <div className="book-header">
            <div className="book-image-container">
              <img 
                src={`http://localhost:8000${book.image}`} 
                alt={book.title} 
                className="book-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              {book.adult_content && (
                <img 
                  src={AdultIcon} 
                  alt="18+" 
                  className="adult-icon"
                />
              )}
              {book.book_type === 'AUTHOR' && (
                <div className="author-badge">A</div>
              )}
            </div>
            <div className="book-info">
              <h1>{book.title}</h1>
              <p className="book-type">
                Тип твору: {getBookTypeLabel(book.book_type)}
              </p>
              <p>{book.description}</p>
            </div>
          </div>

          <BookmarkButton bookId={book.id} />

          <div className="book-statuses">
            {book.book_type === 'TRANSLATION' && (
              <div className="status-block">
                <span className="status-label">Статус перекладу:</span>
                <span className="status-value translation-status">
                  {getTranslationStatusLabel(book.translation_status)}
                </span>
              </div>
            )}
            <div className="status-block">
              <span className="status-label">Статус оригіналу:</span>
              <span className="status-value original-status">
                {getOriginalStatusLabel(book.original_status)}
              </span>
            </div>
          </div>

          <h2>Розділи:</h2>
          {chapters.length > 0 ? (
            <div className="chapters-list">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-item">
                  <span className="chapter-position">{chapter.position}.</span>
                  {chapter.title}
                  <div className="chapter-actions">
                    {chapter.is_paid && !chapter.is_purchased ? (
                      isAuthenticated ? (
                        <button 
                          onClick={() => handlePurchaseChapter(chapter.id)}
                          disabled={isPurchasing}
                          className={`purchase-btn ${isPurchasing ? 'disabled' : ''}`}
                        >
                          {isPurchasing 
                            ? `Купівля${retryCount > 0 ? ` (спроба ${retryCount + 1}/${MAX_RETRIES})` : '...'}` 
                            : `Купити (${Number(chapter.price).toFixed(2)} грн)`}
                        </button>
                      ) : (
                        <Link to="/login" className="login-btn">
                          Увійти для читання
                        </Link>
                      )
                    ) : (
                      <Link 
                        to={`/books/${slug}/chapters/${chapter.slug}`}
                        className="read-btn"
                      >
                        Читати
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Немає доступних розділів</p>
          )}

          <RatingBar bookSlug={slug} />
          
          {book && (
            <BookComments 
              bookSlug={book.slug} 
              book={book}
              isBookOwner={false}
              isAuthenticated={isAuthenticated} 
            />
          )}
        </Container>
      </Container>
    </section>
  );
};

export default BookDetailReader; 