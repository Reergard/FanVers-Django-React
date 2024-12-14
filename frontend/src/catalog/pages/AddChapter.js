import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadChapter as apiUploadChapter } from "../../api/catalog/catalogAPI";
import "../css/Catalog.css";
import { Container } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { catalogAPI } from "../../api/catalog/catalogAPI";
import { handleCatalogApiError } from '../utils/errorUtils';

const AddChapter = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [volumes, setVolumes] = useState([]);
  const [selectedVolume, setSelectedVolume] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [book, setBook] = useState(null);
  const [price, setPrice] = useState('1.00');

  useEffect(() => {
    const checkOwnerAccess = async () => {
      if (!user) {
        toast.error('Необхідна авторизація');
        navigate(`/books/${slug}`);
        return;
      }

      try {
        const bookData = await catalogAPI.fetchBook(slug);
        
        // Проверяем права владельца
        if (user.id !== bookData.owner) {
          toast.error('У вас немає прав для додавання глав до цієї книги');
          navigate(`/books/${slug}`);
          return;
        }

        setBook(bookData);
      } catch (error) {
        handleCatalogApiError(error, toast);
        navigate(`/books/${slug}`);
      }
    };

    checkOwnerAccess();
  }, [slug, user, navigate]);

  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const volumesData = await catalogAPI.getVolumeList(slug);
        setVolumes(volumesData);
      } catch (error) {
        console.error('Error fetching volumes:', error);
        toast.error(error.message || 'Помилка при завантаженні томів');
      }
    };

    fetchVolumes();
  }, [slug]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Пожалуйста, загрузите файл в формате .docx');
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadChapter = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!title || !file) {
        setError('Заполните все обязательные поля');
        return;
      }

      if (isPaid && (!price || price <= 0 || isNaN(price))) {
        setError('Укажите корректную стоимость главы');
        return;
      }

      const volumeId = selectedVolume ? selectedVolume : null;
      await catalogAPI.uploadChapter(
        slug,
        title,
        file,
        isPaid,
        volumeId,
        parseFloat(price)
      );
      
      setTitle('');
      setFile(null);
      setIsPaid(false);
      setSelectedVolume('');
      setPrice('1.00');
      
      toast.success('Глава успішно завантажена');
      
    } catch (error) {
      setError(error.message || 'Помилка при завантаженні глави');
    }
  };

  return (
    <section>
      <Container fluid className="catalog-section" id="catalog">
        <Container className="catalog-content">
          <div>
            <h2>Добавить главу</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleUploadChapter}>
              <div>
                <label htmlFor="title">Название главы:</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="file">Загрузить .docx файл:</label>
                <input
                  type="file"
                  id="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                  />
                  Закрытый доступ (требует оплаты)
                </label>
              </div>

              {volumes.length > 0 && (
                <div>
                  <label htmlFor="volume">Том:</label>
                  <select
                    id="volume"
                    value={selectedVolume}
                    onChange={(e) => setSelectedVolume(e.target.value)}
                  >
                    <option value="">Выберите том</option>
                    {volumes.map((volume) => (
                      <option key={volume.id} value={volume.id}>
                        {volume.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isPaid && (
                <div className="form-group">
                  <label htmlFor="price">Вартість глави:</label>
                  <input
                    type="number"
                    id="price"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="Введіть вартість"
                  />
                </div>
              )}

              <button type="submit">Добавить главу</button>
            </form>
          </div>
        </Container>
      </Container>
    </section>
  );
};

export default AddChapter;