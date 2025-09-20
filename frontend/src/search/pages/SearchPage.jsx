import React, { useState, useEffect } from "react";
import {
    useQuery, useMutation,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchBooks } from '../../api/catalog/catalogAPI';
import { handleCatalogApiError } from '../../catalog/utils/errorUtils';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { searchAPI } from '../../api/search/searchAPI';
import "../styles/Search.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useToast } from "../../components/CustomToast";
import { BreadCrumb } from '../../main/components/BreadCrumb';
// import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { useSelector } from "react-redux";

import searchIcon from '../../main/images/Search_light.svg';
import AdultIcon from '../../catalog/pages/img/18.svg';

const NovelCard = ({ title, description, image, slug, book_type, adult_content }) => {
    return (
        <Link to={`/books/${slug}`} className="novel-card-link">
            <div className="novel-card UserTranslations">
                <div className="novel-cover">
                    <div className="image-container">
                        <div className="image-wrapper">
                            <img
                                src={image}
                                alt={title}
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
                            {book_type === 'AUTHOR' && (
                                <span className="novel-letter">a</span>
                            )}
                            {adult_content && (
                                <img src={AdultIcon} alt="18+" className="novel-adult-icon" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="all-desc-catalog">
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дата створення </div>
                        <span>14.02.2023</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дата останньої активности </div>
                        <span>14.02.2023</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Переглядів за день</div>
                        <span>150</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дохід за день </div>
                        <span>15$</span>
                    </div>
                    <div className="one-desc">
                        <div className="name-desc-catalog">Дохід за місяць</div>
                        <span>15$</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        title: "",
        genres: [],
        tags: [],
        fandoms: [],
        exclude_genres: [],
        exclude_tags: [],
        exclude_fandoms: [],
        min_chapters: "",
        max_chapters: "",
        order: "-chapter_count", // По умолчанию сортировка по количеству глав (по убыванию)
        adult_content: true, // Показывать взрослый контент по умолчанию
    });
    
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const { error: showError } = useToast();

    // Загружаем данные для фильтров
    const { data: genres } = useQuery({
        queryKey: ["genres"],
        queryFn: catalogAPI.fetchGenres,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 10 * 60 * 1000, // 10 минут
    });
    const { data: tags } = useQuery({
        queryKey: ["tags"],
        queryFn: catalogAPI.fetchTags,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 10 * 60 * 1000, // 10 минут
    });
    const { data: countries } = useQuery({
        queryKey: ["countries"],
        queryFn: catalogAPI.fetchCountries,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 10 * 60 * 1000, // 10 минут
    });
    const { data: fandoms } = useQuery({
        queryKey: ["fandoms"],
        queryFn: catalogAPI.fetchFandoms,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 10 * 60 * 1000, // 10 минут
    });

    const [openFilters, setOpenFilters] = useState({
        genres: false,
        tags: false,
        fandoms: false,
        exclude_genres: false,
        exclude_tags: false,
        exclude_fandoms: false,
        chapters: false,
    });

    const toggleFilter = (filterName) => {
        setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
    };

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

    // Обработка URL параметров при загрузке страницы
    useEffect(() => {
        const queryFromUrl = searchParams.get('q');
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
        }
    }, [searchParams]);

    // Очистка таймаута при размонтировании
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const hideAdultContent = useSelector(
        (state) => state.userSettings.hideAdultContent
    );

    // Убираем загрузку рекламы - она не нужна на странице поиска

    // Функция поиска
    const performSearch = useCallback(async () => {
        setIsSearching(true);
        setError(null);
        
        try {
            // Обновляем фильтры с поисковым запросом
            const searchFilters = {
                ...filters,
                title: searchQuery,
                adult_content: !hideAdultContent, // Учитываем настройки пользователя
            };

            const searchResults = await searchAPI.searchBooks(searchFilters);
            setBooks(searchResults.results || searchResults || []);
            setVisibleCount(3); // Сбрасываем счетчик видимых книг
        } catch (error) {
            console.error("Search error:", error);
            setError("Помилка пошуку. Спробуйте ще раз.");
            setBooks([]);
        } finally {
            setIsSearching(false);
        }
    }, [filters, searchQuery, hideAdultContent]);

    // Начальный поиск при загрузке страницы или изменении searchQuery
    useEffect(() => {
        performSearch();
    }, [performSearch, searchQuery]); // Добавляем searchQuery в зависимости

    const showMoreBooks = () => {
        setVisibleCount((prevCount) => prevCount + 3);
    };

    // Автоматический поиск с задержкой
    const performSearchWithDelay = useCallback(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            performSearch();
        }, 500); // 500ms задержка
        
        setSearchTimeout(timeout);
    }, [searchTimeout, performSearch]);

    // Обработчик поиска по Enter
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    // Обработчик клика по иконке поиска
    const handleSearchClick = () => {
        performSearch();
    };

    // Обработчик изменения фильтров
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Обработчик множественного выбора
    const handleMultiSelect = (filterType, itemId) => {
        setFilters(prev => {
            const currentArray = prev[filterType] || [];
            const newArray = currentArray.includes(itemId)
                ? currentArray.filter(id => id !== itemId)
                : [...currentArray, itemId];
            
            return {
                ...prev,
                [filterType]: newArray
            };
        });
        // Автоматический поиск при изменении фильтров
        performSearchWithDelay();
    };

    // Обработчик изменения количества глав
    const handleChaptersChange = (type, value) => {
        const numValue = value === "" ? "" : parseInt(value);
        setFilters(prev => ({
            ...prev,
            [type]: numValue
        }));
        // Автоматический поиск при изменении фильтров
        performSearchWithDelay();
    };

    // Обработчик сортировки
    const handleSortChange = (order) => {
        setFilters(prev => ({
            ...prev,
            order
        }));
        // Автоматический поиск при изменении сортировки
        performSearchWithDelay();
    };

    // Фильтрация книг по настройкам пользователя
    const filteredBooks = books.filter((book) => {
        if (hideAdultContent && book.adult_content) {
            return false;
        }
        return true;
    });

    return (
        <section>
            <div className="catalog-section container-search" id="catalog">
                <BreadCrumb
                    items={[
                        { href: "/", label: "Головна" },
                        { href: "/search", label: "Пошук" },
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
                    
                    <div className="search-block">
                        <input 
                            placeholder="Пошук..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                        /> 
                        <img 
                            src={searchIcon} 
                            onClick={handleSearchClick}
                            style={{ cursor: 'pointer' }}
                            alt="Пошук"
                        />
                    </div>
                    
                    <div className="sort-search">
                        <div className="sort">
                            <span>Сортувати за:</span>{" "}
                            <div className="params-sort-all">
                                <div 
                                    className="sort-books"
                                    onClick={() => handleSortChange("-chapter_count")}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Кількість книг
                                </div>
                                <div className="sort-arrow">▼</div>
                            </div>
                        </div>
                    </div>
                    
                    {error ? (
                        <p>{error}</p>
                    ) : (
                        <div className="user-selector-block-search">
                            <div style={{ paddingTop: "0" }} className="all-ell-catalog">
                                <div className="novels-container-catalog translator">
                                    {isSearching ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <p>Пошук...</p>
                                        </div>
                                    ) : filteredBooks.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <p>Книги не знайдено. Спробуйте змінити критерії пошуку.</p>
                                        </div>
                                    ) : (
                                        filteredBooks.slice(0, visibleCount).map((book) => (
                                            <NovelCard
                                                key={book.id}
                                                title={book.title}
                                                description={book.description}
                                                image={book.image}
                                                slug={book.slug}
                                                book_type={book.book_type}
                                                adult_content={book.adult_content}
                                            />
                                        ))
                                    )}
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
                                        Показати ще
                                    </button>
                                )}
                            </div>
                            
                            <div className={`search-filters ${isMobile && isFiltersOpen ? "open" : ""}`}>
                                <h2 className="title-search-filters">Фільтри</h2>
                                <div className="all-filters">
                                    {/* Жанры */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("genres")}>
                                            <span>Жанри</span>
                                            <p className={openFilters.genres ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.genres && (
                                            <div className="genre-list-filter">
                                                {genres?.map((genre) => (
                                                    <div
                                                        key={genre.id}
                                                        className={`genre-item-filter ${filters.genres.includes(genre.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("genres", genre.id)}
                                                    >
                                                        {genre.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Теги */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("tags")}>
                                            <span>Теги</span>
                                            <p className={openFilters.tags ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.tags && (
                                            <div className="genre-list-filter">
                                                {tags?.map((tag) => (
                                                    <div
                                                        key={tag.id}
                                                        className={`genre-item-filter ${filters.tags.includes(tag.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("tags", tag.id)}
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Фандомы */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("fandoms")}>
                                            <span>Фендоми</span>
                                            <p className={openFilters.fandoms ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.fandoms && (
                                            <div className="genre-list-filter">
                                                {fandoms?.map((fandom) => (
                                                    <div
                                                        key={fandom.id}
                                                        className={`genre-item-filter ${filters.fandoms.includes(fandom.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("fandoms", fandom.id)}
                                                    >
                                                        {fandom.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Исключить жанры */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("exclude_genres")}>
                                            <span>Виключити жанри</span>
                                            <p className={openFilters.exclude_genres ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.exclude_genres && (
                                            <div className="genre-list-filter">
                                                {genres?.map((genre) => (
                                                    <div
                                                        key={genre.id}
                                                        className={`genre-item-filter ${filters.exclude_genres.includes(genre.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("exclude_genres", genre.id)}
                                                    >
                                                        {genre.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Исключить теги */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("exclude_tags")}>
                                            <span>Виключити теги</span>
                                            <p className={openFilters.exclude_tags ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.exclude_tags && (
                                            <div className="genre-list-filter">
                                                {tags?.map((tag) => (
                                                    <div
                                                        key={tag.id}
                                                        className={`genre-item-filter ${filters.exclude_tags.includes(tag.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("exclude_tags", tag.id)}
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Исключить фандомы */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("exclude_fandoms")}>
                                            <span>Виключити фендоми</span>
                                            <p className={openFilters.exclude_fandoms ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.exclude_fandoms && (
                                            <div className="genre-list-filter">
                                                {fandoms?.map((fandom) => (
                                                    <div
                                                        key={fandom.id}
                                                        className={`genre-item-filter ${filters.exclude_fandoms.includes(fandom.id) ? "selected" : ""}`}
                                                        onClick={() => handleMultiSelect("exclude_fandoms", fandom.id)}
                                                    >
                                                        {fandom.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Количество разделов */}
                                    <div className="one-filter">
                                        <div className="one-filter-param" onClick={() => toggleFilter("chapters")}>
                                            <span>Кількість розділів</span>
                                            <p className={openFilters.chapters ? "rotated" : ""}>▷</p>
                                        </div>
                                        {openFilters.chapters && (
                                            <div className="genre-list-filter">
                                                <div style={{ padding: '10px' }}>
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <label>Мінімум:</label>
                                                        <input
                                                            type="number"
                                                            value={filters.min_chapters}
                                                            onChange={(e) => handleChaptersChange("min_chapters", e.target.value)}
                                                            style={{ marginLeft: '10px', padding: '5px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>Максимум:</label>
                                                        <input
                                                            type="number"
                                                            value={filters.max_chapters}
                                                            onChange={(e) => handleChaptersChange("max_chapters", e.target.value)}
                                                            style={{ marginLeft: '10px', padding: '5px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={performSearch}>Пошук</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SearchPage;
