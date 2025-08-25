import React, { useState, useEffect } from "react";
import {
    useQuery, useMutation,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { fetchBooks } from '../../api/catalog/catalogAPI';
import { handleCatalogApiError } from '../../catalog/utils/errorUtils';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import "../styles/TranslatorsList.css";
import { Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { useSelector } from "react-redux";

import searchIcon from '../../main/images/Search_light.svg';
const NovelCard = ({ title, description, image, slug }) => {
    return (
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
                        <span className="novel-letter">a</span>
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
    );
};

const SearchPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        title_en: "",
        book_type: "TRANSLATION",
        author: "",
        description: "",
        genres: [],
        tags: [],
        country: "",
        fandoms: [],
        adult_content: false,
        image: null,
        translation_status: "TRANSLATING",
        original_status: "",
    });
    const { data: genres } = useQuery({
        queryKey: ["genres"],
        queryFn: catalogAPI.fetchGenres,
    });
    const { data: tags } = useQuery({
        queryKey: ["tags"],
        queryFn: catalogAPI.fetchTags,
    });
    const { data: countries } = useQuery({
        queryKey: ["countries"],
        queryFn: catalogAPI.fetchCountries,
    });
    const { data: fandoms } = useQuery({
        queryKey: ["fandoms"],
        queryFn: catalogAPI.fetchFandoms,
    });
    const [openFilters, setOpenFilters] = useState({
        genres: false,
        tags: false,
        fandoms: false,
    });

    const toggleFilter = (filterName) => {
        setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
    };
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [isOpen, setIsOpen] = useState(false);

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
    const showMoreBooks = () => {
        setVisibleCount((prevCount) => prevCount + 3);
    };
    const hideAdultContent = useSelector(
        (state) => state.userSettings.hideAdultContent
    );

    const { data: advertisedBooks, isLoading: isLoadingAds } = useQuery({
        queryKey: ["catalogAds"],
        queryFn: websiteAdvertisingAPI.getCatalogAds,
        onError: (error) => {
            console.error("Error loading catalog advertisements:", error);
        },
    });

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const booksData = await fetchBooks();
                setBooks(booksData);
            } catch (error) {
                handleCatalogApiError(error, toast);
                setError("Не вдалось завантажити данні");
            }
        };

        loadBooks();
    }, []);

    const filteredBooks = books.filter((book) => {
        if (hideAdultContent && book.adult_content) {
            return false;
        }
        return true;
    });

    return (
        <section>

            <div fluid className="catalog-section container-search" id="catalog">
                <BreadCrumb
                    items={[
                        { href: "/", label: "Головна" },
                        { href: "/search", label: "Пошук" },
                    ]}
                />
                <div className="catalog-content">
                    {/* <HomePage1 /> */}
                    {isMobile && (
                        <button
                            className="filter-button"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        >
                            Фільтри
                        </button>
                    )}
                    <div className="search-block"><input placeholder="Пошук..." /> <img src={searchIcon} /></div>
                    <div className="sort-search">
                        <div className="sort">
                            <span>Сортувати за:</span>{" "}
                            <div className="params-sort-all">
                                <div className="sort-books">Кількість книг</div>
                                <div className="sort-arrow">▼</div>
                            </div>
                        </div>
                    </div>
                    {error ? (
                        <p>{error}</p>
                    ) : (
                        <div className="user-selector-block-search">
                            <div style={{ paddingTop: "0" }} className="all-ell-catalog">
                                <div
                                    className="novels-container-catalog translator"
                                >
                                    {filteredBooks.slice(0, visibleCount).map((book) => (
                                        <NovelCard
                                            key={book.id}
                                            title={book.title}
                                            description={book.description}
                                            image={book.image}
                                            slug={book.slug}
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
                            <div className={`search-filters ${isMobile && isFiltersOpen ? "open" : ""}`}>
                                <h2 className="title-search-filters">Фільтри</h2>
                                <div className="all-filters">



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
                                                        className={`genre-item-filter ${formData.genres.includes(genre.id) ? "selected" : ""}`}
                                                        onClick={() => {
                                                            const newGenres = formData.genres.includes(genre.id)
                                                                ? formData.genres.filter((id) => id !== genre.id)
                                                                : [...formData.genres, genre.id];

                                                            setFormData({ ...formData, genres: newGenres });
                                                        }}
                                                    >
                                                        {genre.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

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
                                                        className={`genre-item-filter ${formData.tags.includes(tag.id) ? "selected" : ""}`}
                                                        onClick={() => {
                                                            const newTags = formData.tags.includes(tag.id)
                                                                ? formData.tags.filter((id) => id !== tag.id)
                                                                : [...formData.tags, tag.id];

                                                            setFormData({ ...formData, tags: newTags });
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                                                        className={`genre - item - filter ${formData.fandoms.includes(fandom.id) ? "selected" : ""}`}
                                                        onClick={() => {
                                                            const newFandoms = formData.fandoms.includes(fandom.id)
                                                                ? formData.fandoms.filter((id) => id !== fandom.id)
                                                                : [...formData.fandoms, fandom.id];

                                                            setFormData({ ...formData, fandoms: newFandoms });
                                                        }}
                                                    >
                                                        {fandom.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="one-filter-param"><span>Виключити жанри</span> <p>▷</p></div>
                                    <div className="one-filter-param"><span>Виключити теги</span> <p>▷</p></div>
                                    <div className="one-filter-param"><span>Виключити фендоми</span> <p>▷</p></div>
                                    <div className="one-filter-param"><span>Кількість розділів</span> <p>▷</p></div>
                                </div>
                                <button>Пошук</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section >
    );
};

export default SearchPage;
