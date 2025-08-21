import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "../../api/users/usersAPI";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BreadCrumb } from "../../main/components/BreadCrumb";
import { websiteAdvertisingAPI } from "../../api/website_advertising/website_advertisingAPI";
import { Link } from "react-router-dom";
import "../../navigation/css/BookmarksPage.css";

import searchIcon from "../../main/images/Search_light.svg";

const NovelCard = ({ book, status }) => {
    // Перевіряємо, чи є книга та її основні дані
    if (!book || !book.id) {
        return (
            <div className="novel-card UserTranslations error-card">
                <div className="error-content">
                    <p>Помилка завантаження даних книги</p>
                </div>
            </div>
        );
    }

    const imageUrl = book.image ? (book.image.startsWith('http') ? book.image : `http://localhost:8000${book.image}`) : '';
    
    // Функція для форматування дати
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('uk-UA');
        } catch (error) {
            return '—';
        }
    };
    
    // Функція для отримання імені автора
    const getAuthorName = () => {
        return book.author?.name || book.author_username || book.creator_username || book.owner_username || '—';
    };
    
    // Якщо немає slug, показуємо картку без посилання
    if (!book.slug) {
        return (
            <div className="novel-card UserTranslations no-link-card">
                <div className="novel-cover">
                    <div className="image-container">
                        <div className="image-wrapper">
                            <img
                                src={imageUrl}
                                alt={book.title || 'Книга'}
                                className="novel-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                }}
                            />
                            <div
                                className="divider"
                                role="separator"
                                aria-orientation="vertical"
                            />
                            <span className="novel-letter">a</span>
                        </div>
                    </div>
                </div>
                <div className="all-desc-catalog">
                    <div className="one-desc">
                        <div className="name-desc-catalog">Назва книги</div>
                        <span>{book.title || 'Без назви'}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Автор</div>
                        <span>{getAuthorName()}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Статус закладки</div>
                        <span>{getStatusLabel(status)}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дата додавання</div>
                        <span>{formatDate(book.created_at)}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дії</div>
                        <span className="no-link">Посилання недоступне</span>
                    </div>
                </div>
            </div>
        );
    }
    
    // Картка з посиланням - вся картка клікабельна
    return (
        <Link to={`/books/${book.slug}`} className="book-card-link">
            <div className="novel-card UserTranslations clickable">
                <div className="novel-cover">
                    <div className="image-container">
                        <div className="image-wrapper">
                            <img
                                src={imageUrl}
                                alt={book.title || 'Книга'}
                                className="novel-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                }}
                            />
                            <div
                                className="divider"
                                role="separator"
                                aria-orientation="vertical"
                            />
                            <span className="novel-letter">a</span>
                        </div>
                    </div>
                </div>
                <div className="all-desc-catalog">
                    <div className="one-desc">
                        <div className="name-desc-catalog">Назва книги</div>
                        <span>{book.title || 'Без назви'}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Автор</div>
                        <span>{getAuthorName()}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Статус закладки</div>
                        <span>{getStatusLabel(status)}</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дата додавання</div>
                        <span>{formatDate(book.created_at)}</span>
                    </div>
                    
                </div>
            </div>
        </Link>
    );
};

// Функція для перекладу статусу закладки
const getStatusLabel = (status) => {
    const statusLabels = {
        'reading': 'Читаю',
        'dropped': 'Кинув читати',
        'planned': 'В планах',
        'completed': 'Прочитав'
    };
    return statusLabels[status] || status;
};

const BookmarksPage = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [visibleCount, setVisibleCount] = useState(3);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const currentUser = useSelector(state => state.auth.user);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 900);
            if (window.innerWidth > 900) {
                setIsFiltersOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const showMoreBooks = async () => {
        setIsLoadingMore(true);
        // Імітуємо затримку для кращого UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setVisibleCount((prevCount) => prevCount + 3);
        setIsLoadingMore(false);
    };

    // Обробка зміни статусу фільтра
    const handleStatusChange = (newStatus) => {
        setSelectedStatus(newStatus);
        setVisibleCount(3); // Скидаємо лічильник при зміні фільтра
    };

    const hideAdultContent = useSelector(
        (state) => state.userSettings.hideAdultContent
    );

    // Завантаження закладок користувача
    const { data: bookmarks = [], isLoading: bookmarksLoading, error: bookmarksError, refetch: refetchBookmarks } = useQuery({
        queryKey: ['user-bookmarks', currentUser?.id, selectedStatus],
        queryFn: () => usersAPI.getUserBookmarks(selectedStatus),
        enabled: !!isAuthenticated && !!currentUser?.id,
        onError: (error) => {
            console.error('Error loading bookmarks:', error);
            toast.error('Помилка завантаження закладок');
        }
    });

    // Завантаження реклами
    const { data: advertisedBooks, isLoading: isLoadingAds } = useQuery({
        queryKey: ["catalogAds"],
        queryFn: websiteAdvertisingAPI.getCatalogAds,
        onError: (error) => {
            console.error("Error loading catalog advertisements:", error);
        },
    });

    // Фільтрація закладок за статусом (тепер робиться на backend)
    const filteredBookmarks = bookmarks.filter((bookmark) => {
        if (hideAdultContent && bookmark.book?.adult_content) {
            return false;
        }
        return true;
    });

    // Якщо користувач не авторизований
    if (!isAuthenticated) {
        return (
            <section>
                <div fluid className="catalog-section container-search" id="catalog">
                    <BreadCrumb
                        items={[
                            { href: "/", label: "Головна" },
                            { href: "/bookmarks", label: "Закладки" },
                        ]}
                    />
                    <div className="catalog-content">
                        <div className="auth-required-message">
                            <h2>Для перегляду закладок необхідно увійти в систему</h2>
                            <p>Увійдіть або зареєструйтесь, щоб мати доступ до ваших закладок</p>
                            <Link to="/login" className="login-btn">
                                Увійти
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div fluid className="catalog-section container-search" id="catalog">
                <BreadCrumb
                    items={[
                        { href: "/", label: "Головна" },
                        { href: "/bookmarks", label: "Закладки" },
                    ]}
                />
                <div className="catalog-content">
                    {isMobile && (
                        <button
                            className="filter-button"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        >
                            Фільтри
                        </button>
                    )}
                    
                    {bookmarksError ? (
                        <div className="error-message">
                            <p>Помилка завантаження закладок: {bookmarksError.message}</p>
                            <button 
                                onClick={() => refetchBookmarks()} 
                                className="retry-btn"
                                disabled={bookmarksLoading}
                            >
                                {bookmarksLoading ? 'Спроба...' : 'Спробувати ще раз'}
                            </button>
                        </div>
                    ) : bookmarksLoading ? (
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            Завантаження закладок...
                        </div>
                    ) : (
                        <div className="user-selector-block-search">
                            <div style={{ paddingTop: "0" }} className="all-ell-catalog">
                                {filteredBookmarks.length > 0 ? (
                                    <>
                                        <div className="novels-container-catalog translator">
                                            {filteredBookmarks.slice(0, visibleCount).map((bookmark) => (
                                                <NovelCard
                                                    key={bookmark.id}
                                                    book={bookmark.book}
                                                    status={bookmark.status}
                                                />
                                            ))}
                                        </div>
                                        {visibleCount < filteredBookmarks.length && (
                                            <button 
                                                className="show-more-btn" 
                                                onClick={showMoreBooks}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? (
                                                    <>
                                                        <div className="loading-spinner small"></div>
                                                        Завантаження...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            viewBox="0 0 18 18"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <g clipPath="url(#clip0_2044_17077)">
                                                                <path
                                                                    d="M12.18 16C13.6835 15.3632 14.9508 14.2903 15.8104 12.9264C16.6701 11.5625 17.0808 9.97333 16.9868 8.37384C16.8929 6.77435 16.2989 5.24163 15.2852 3.98291C14.2715 2.72418 12.887 1.80017 11.3188 1.33579C9.75061 0.871417 8.0744 0.889071 6.5168 1.38637C4.9592 1.88367 3.59534 2.83663 2.6096 4.11641C1.62387 5.39619 1.0638 6.94107 1.00513 8.54217C0.946461 10.1433 1.39201 11.7234 2.28155 13.0689"
                                                                    stroke="#F58807"
                                                                    strokeLinecap="round"
                                                                />
                                                                <path
                                                                    d="M12.0683 12.6361L11.4533 16.704L15.5211 17.319"
                                                                    stroke="#F58807"
                                                                    strokeLinecap="round"
                                                                />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_2044_17077">
                                                                    <rect width="18" height="18" fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                        Показати ще ({filteredBookmarks.length - visibleCount} залишилось)
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-bookmarks-message">
                                        <h3>У вас поки немає закладок</h3>
                                        <p>Додайте книги в закладки, щоб вони з'явились тут</p>
                                        <Link to="/catalog" className="browse-catalog-btn">
                                            Переглянути каталог
                                        </Link>
                                    </div>
                                )}
                            </div>
                            
                            <div className={`search-filters ${isMobile && isFiltersOpen ? "open" : ""}`}>
                                <h2 className="title-search-filters">Фільтри</h2>
                                <div className="all-filters bookmarks">
                                    <div 
                                        className={`one-filter-param bookmarks-param ${selectedStatus === 'all' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('all')}
                                    >
                                        <span>Усі</span> <p>▷</p>
                                    </div>
                                    <div 
                                        className={`one-filter-param bookmarks-param ${selectedStatus === 'reading' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('reading')}
                                    >
                                        <span>Читаю</span> <p>▷</p>
                                    </div>
                                    <div 
                                        className={`one-filter-param bookmarks-param ${selectedStatus === 'planned' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('planned')}
                                    >
                                        <span>В планах</span> <p>▷</p>
                                    </div>
                                    <div 
                                        className={`one-filter-param bookmarks-param ${selectedStatus === 'dropped' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('dropped')}
                                    >
                                        <span>Кинув</span> <p>▷</p>
                                    </div>
                                    <div 
                                        className={`one-filter-param bookmarks-param ${selectedStatus === 'completed' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('completed')}
                                    >
                                        <span>Прочитав</span> <p>▷</p>
                                    </div>
                                </div>
                                <div className="bookmarks-count">
                                    Знайдено: {filteredBookmarks.length} закладок
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BookmarksPage;
