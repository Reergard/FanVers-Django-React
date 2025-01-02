import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsBooksAPI } from '../../api/analytics_books/analytics_booksAPI';
import '../styles/MagicalGuide.css';

const MagicalGuide1 = () => {
  const [activeTab, setActiveTab] = useState('day');
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'day', label: 'Топ дня' },
    { id: 'week', label: 'Топ тижня' },
    { id: 'month', label: 'Топ місяця' },
    { id: 'all_time', label: 'Загальний Топ 15' }
  ];

  useEffect(() => {
    fetchTrendingBooks(activeTab);
  }, [activeTab]);

  const fetchTrendingBooks = async (type) => {
    try {
      setLoading(true);
      const data = await analyticsBooksAPI.fetchTrendingBooks(type);
      setTrendingBooks(data);
      setError(null);
    } catch (err) {
      setError('Помилка при завантаженні трендів');
      console.error('Error fetching trending books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guide-container">
      <h1>Чарівний Гід</h1>
      
      <section className="trending-section">
        <h2>Тренди</h2>
        
        <div className="trending-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="trending-books-grid">
            {trendingBooks.map(book => (
              <Link to={`/books/${book.slug}`} key={book.id} className="book-card">
                <div className="book-image">
                  <img src={book.image || '/default-book.png'} alt={book.title} />
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  {book.translation_status && (
                    <span className="status">{book.translation_status_display}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MagicalGuide1;