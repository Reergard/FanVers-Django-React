import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchBooks } from "../../api/catalog/catalogAPI";

import "../css/Catalog.css";

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await fetchBooks();       
        setBooks(booksData);
      } catch (error) {
        setError('Не вдалось завантажити данні');
      }
    };

    loadBooks();
  }, []);

  return (
    <section>
      <Container fluid className="catalog-section" id="catalog">
        <Container className="catalog-content">
          <h1>Каталог</h1>
          {error ? (
            <p>{error}</p>
          ) : (
            <ul className="book-list">
              {books.map(book => (
                <li key={book.id} className="book-item">
                  {book.image && (
                    <img 
                      src={book.image}
                      alt={book.title} 
                      className="book-image" 
                      onError={(e) => {
                        console.log('Image load error:', book.image);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="book-details">
                    <h2>{book.title}</h2>
                    <p>Автор: {book.author}</p>
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
