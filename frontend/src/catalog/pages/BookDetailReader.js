import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
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
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const currentUser = useSelector(state => state.auth.user);

  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const response = await catalogAPI.getChapterList(slug);
      return response.data;
    },
    enabled: !!slug,
  });

  if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;
  if (bookError) return <div>Помилка: {bookError.message}</div>;
  if (!book) return <div>Книгу не знайдено</div>;

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
                          className="purchase-btn"
                        >
                          Купити ({Number(chapter.price).toFixed(2)} грн)
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
            <BookComments bookSlug={book.slug} isAuthenticated={isAuthenticated} />
          )}
        </Container>
      </Container>
    </section>
  );
};

export default BookDetailReader; 