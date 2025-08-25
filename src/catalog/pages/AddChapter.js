import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import './AddChapter.css';

const AddChapter = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Будь ласка, виберіть текстовий файл (.txt)');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!title || !file) {
        setError('Заповніть усі обов\'язкові поля');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('book', bookId);

      await catalogAPI.addChapter(formData);
      
      // Перенаправляємо на сторінку книги
      navigate(`/catalog/book/${bookId}`);
    } catch (error) {
      console.error('Помилка при додаванні розділу:', error);
      setError('Помилка при додаванні розділу. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-chapter-container">
      <div className="add-chapter-card">
        <h2>Додати новий розділ</h2>
        
        <form onSubmit={handleSubmit} className="add-chapter-form">
          <div className="form-group">
            <label htmlFor="title">Назва розділу:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введіть назву розділу"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Файл розділу:</label>
            <input
              type="file"
              id="file"
              accept=".txt"
              onChange={handleFileChange}
              required
            />
            <small>Підтримуються тільки текстовиі файли (.txt)</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/catalog/book/${bookId}`)}
              className="btn-secondary"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Додавання...' : 'Додати розділ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapter;
