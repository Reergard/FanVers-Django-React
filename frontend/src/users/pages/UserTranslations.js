import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from '../../api/catalog/catalogAPI';
import { handleCatalogApiError } from '../../catalog/utils/errorUtils';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { usersAPI } from '../../api/users/usersAPI';
import "../styles/TranslatorsList.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useToast } from "../../components/CustomToast";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { useSelector } from "react-redux";
import AdultIcon from "../../catalog/pages/img/18.svg";

const NovelCard = ({ book }) => {
  // Форматируем дату создания
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA');
  };

  // Форматируем дату последней активности
  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} днів тому`;
    return date.toLocaleDateString('uk-UA');
  };

  // Проверяем наличие slug для навигации
  if (!book.slug) {
    return (
              <div className="novel-card UserTranslations no-link-card">
        <div className="novel-cover">
          <div className="image-container">
            <div className="image-wrapper">
              <img
                src={book.image || '/images/default-book-cover.jpg'}
                alt={book.title}
                className="novel-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
              {book.adult_content && (
                <img src={AdultIcon} alt="18+" className="novel-adult-icon" />
              )}
              <div
                className="divider"
                role="separator"
                aria-orientation="vertical"
              />
              {book.book_type === 'AUTHOR' && (
                <span className="novel-letter">a</span>
              )}
            </div>
          </div>
        </div>
        <div className="all-desc-catalog">
          <div className="one-desc">
            <div className="name-desc-catalog">Дата створення </div>
            <span>{formatDate(book.created)}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дата останньої активности </div>
            <span>{formatLastActivity(book.last_updated)}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Переглядів за день</div>
            <span>{book.daily_views || 0}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дохід за день </div>
            <span>{book.daily_income ? `${book.daily_income.toFixed(2)}$` : '0$'}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дохід за місяць</div>
            <span>{book.monthly_income ? `${book.monthly_income.toFixed(2)}$` : '0$'}</span>
          </div>
        </div>
        <div className="click-hint">Книга без slug - навігація недоступна</div>
      </div>
    );
  }

  // Карточка с навигацией - вся карточка кликабельна
  return (
    <Link to={`/books/${book.slug}`} className="book-card-link">
      <div className="novel-card UserTranslations clickable">
        <div className="novel-cover">
          <div className="image-container">
            <div className="image-wrapper">
              <img
                src={book.image || '/images/default-book-cover.jpg'}
                alt={book.title}
                className="novel-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
              {book.adult_content && (
                <img src={AdultIcon} alt="18+" className="novel-adult-icon" />
              )}
              <div
                className="divider"
                role="separator"
                aria-orientation="vertical"
              />
              {book.book_type === 'AUTHOR' && (
                <span className="novel-letter">a</span>
              )}
            </div>
          </div>
        </div>
        <div className="all-desc-catalog">
          <div className="one-desc">
            <div className="name-desc-catalog">Дата створення </div>
            <span>{formatDate(book.created)}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дата останньої активности </div>
            <span>{formatLastActivity(book.last_updated)}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Переглядів за день</div>
            <span>{book.daily_views || 0}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дохід за день </div>
            <span>{book.daily_income ? `${book.daily_income.toFixed(2)}$` : '0$'}</span>
          </div>
          <div className="one-desc">
            <div className="name-desc-catalog">Дохід за місяць</div>
            <span>{book.monthly_income ? `${book.monthly_income.toFixed(2)}$` : '0$'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const UserTranslations = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [userStatistics, setUserStatistics] = useState(null);
  const { error: showError } = useToast();
  const hideAdultContent = useSelector(
    (state) => state.userSettings.hideAdultContent
  );

  const showMoreBooks = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log('UserTranslations: Загружаем переводы пользователя...');
        const booksData = await catalogAPI.fetchUserTranslations();
        console.log('UserTranslations: Получены данные:', booksData);
        setBooks(booksData);
        setError(null); // Очищаем ошибку при успехе
      } catch (error) {
        console.error('UserTranslations: Ошибка загрузки:', error);
        handleCatalogApiError(error, { error: showError });
        setError("Не вдалось завантажити данні");
      }
    };

    const loadUserStatistics = async () => {
      try {
        console.log('UserTranslations: Загружаем статистику пользователя...');
        const statsData = await usersAPI.getUserStatistics();
        console.log('UserTranslations: Получена статистика:', statsData);
        setUserStatistics(statsData);
      } catch (error) {
        console.error('UserTranslations: Ошибка загрузки статистики:', error);
        // Не показываем ошибку пользователю, так как это не критично
      }
    };

    loadBooks();
    loadUserStatistics();
  }, [showError]);

  const filteredBooks = books.filter((book) => {
    if (hideAdultContent && book.adult_content) {
      return false;
    }
    return true;
  });

  return (
    <section>
      <Container fluid className="catalog-section" id="catalog">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/User-translations", label: "Власні переклади" },
          ]}
        />
        <Container className="catalog-content">
          {/* <HomePage1 /> */}

          {error ? (
            <p>{error}</p>
          ) : books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <p>У вас поки немає перекладів. Створіть першу книгу!</p>
            </div>
          ) : (
            <div className="user-selector-block">
              <div style={{ paddingTop: "0" }} className="all-ell-catalog">
                <div
                  className="novels-container-catalog translator"
                >
                  {filteredBooks.slice(0, visibleCount).map((book) => (
                    <NovelCard
                      key={book.id}
                      book={book}
                    />
                  ))}
                </div>
                {visibleCount < filteredBooks.length && (
            <button className="show-more-btn" onClick={showMoreBooks}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2044_17077)">
                  <path
                    d="M12.18 16C13.6835 15.3632 14.9508 14.2903 15.8104 12.9264C16.6701 11.5625 17.0808 9.97333 16.9868 8.37384C16.8929 6.77435 16.2989 5.24163 15.2852 3.98291C14.2715 2.72418 12.887 1.80017 11.3188 1.33579C9.75061 0.871417 8.0744 0.889071 6.5168 1.38637C4.9592 1.88367 3.59534 2.83663 2.6096 4.11641C1.62387 5.39619 1.0638 6.94107 1.00513 8.54217C0.946461 10.1433 1.39201 11.7234 2.28155 13.0689"
                    stroke="#F58807"
                    stroke-linecap="round"
                  />
                  <path
                    d="M12.0683 12.6361L11.4533 16.704L15.5211 17.319"
                    stroke="#F58807"
                    stroke-linecap="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2044_17077">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Показати ще
            </button>
          )}
              </div>
              <div className="statistics-translations">
                <div className="header-statistics-translations">
                  Cтатистика діяльності
                </div>
                <div className="content-statistics-translations">
                  <div className="one-param-statistics">
                    <span>Книг:</span>
                    <p>{userStatistics?.total_books_count || 0}</p>
                  </div>

                  <div className="one-param-statistics">
                    <span>Сторінок переведено</span>
                    <p>{userStatistics?.total_chapters || 0}</p>
                  </div>

                  <div className="one-param-statistics">
                    <span>Символів переклав</span>
                    <p>{userStatistics?.total_characters ? userStatistics.total_characters.toLocaleString() : 0}</p>
                  </div>
                </div>

                <div className="footer-statistics-translations">
                  <span>Комісія</span>
                  <div className="bg-statistics">
                    {userStatistics?.commission || 15}%
                  </div>
                </div>
              </div>
            </div>
          )}
         
        </Container>
      </Container>
    </section>
  );
};

export default UserTranslations;
