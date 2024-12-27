import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchBooks } from "../../api/catalog/catalogAPI";
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { handleCatalogApiError } from '../utils/errorUtils';
import { getBookTypeLabel } from '../utils/bookUtils';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import "../css/Catalog.css";
import { useSelector } from 'react-redux';

const NovelCard = ({ title, description, image, slug }) => {
    return (
        <div className="novel-card">
            <div className="novel-cover">
                <div className="image-container">
                    <div className="image-wrapper">
                        <img 
                            src={image} 
                            alt={title} 
                            className="novel-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }} 
                        />
                        <div className="divider" role="separator" aria-orientation="vertical" />
                        <span className="novel-letter">a</span>
                    </div>
                </div>
            </div>
            <span className="novel-title">{title}</span>
            <div className="novel-divider" />
            <span className="novel-description">{description}</span>
            <div className="novel-button">
                <Link to={`/books/${slug}`} className="read-button">читати</Link>
            </div>
        </div>
    );
};

const Catalog = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const hideAdultContent = useSelector(state => state.userSettings.hideAdultContent);

    const { data: advertisedBooks, isLoading: isLoadingAds } = useQuery({
        queryKey: ['catalogAds'],
        queryFn: websiteAdvertisingAPI.getCatalogAds,
        onError: (error) => {
            console.error('Error loading catalog advertisements:', error);
        }
    });

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const booksData = await fetchBooks();       
                setBooks(booksData);
            } catch (error) {
                handleCatalogApiError(error, toast);
                setError('Не вдалось завантажити данні');
            }
        };

        loadBooks();
    }, []);

    const filteredBooks = books.filter(book => {
        if (hideAdultContent && book.adult_content) {
            return false;
        }
        return true;
    });

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <h1>Каталог</h1>
                    
                    {/* Секция рекламы */}
                    {advertisedBooks && advertisedBooks.length > 0 && (
                        <div className="main-container">
                            <div className="header-container">
                                <span className="advertisement">Реклама</span>
                                <div className="line" />
                            </div>
                            <div className="novels-container">
                                {advertisedBooks.map(ad => (
                                    <NovelCard 
                                        key={ad.id}
                                        title={ad.book_details.title}
                                        description={ad.book_details.description}
                                        image={ad.book_details.image}
                                        slug={ad.book_details.slug}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Основной список книг */}
                    {error ? (
                        <p>{error}</p>
                    ) : (
                        <div className="novels-container">
                            {filteredBooks.map(book => (
                                <NovelCard 
                                    key={book.id}
                                    title={book.title}
                                    description={book.description}
                                    image={book.image}
                                    slug={book.slug}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </Container>
        </section>
    );
};

export default Catalog;
