import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchBooks } from "../../api/catalog/catalogAPI";
import { handleCatalogApiError } from '../utils/errorUtils';
import { getBookTypeLabel } from '../utils/bookUtils';
import { toast } from 'react-toastify';
import "../css/Catalog.css";
import { useSelector } from 'react-redux';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const hideAdultContent = useSelector(state => state.userSettings.hideAdultContent);

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
          {error ? (
            <p>{error}</p>
          ) : (
            <ul className="book-list">
              {filteredBooks.map(book => (
                <li key={book.id} className="book-item">
                  {book.image && (
                    <img 
                      src={book.image}
                      alt={book.title} 
                      className="book-image" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="book-details">
                    <h2>{book.title}</h2>
                    <p>Автор: {book.author}</p>
                    <p>Тип: {getBookTypeLabel(book.book_type)}</p>
                    <p>Опис: {book.description}</p>
                    <Link to={`/books/${book.slug}`}>Читати</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Container>
    </section>
  );
};

export default Catalog;
