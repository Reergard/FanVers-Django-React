import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadChapter as apiUploadChapter } from "../api";
import "../css/Catalog.css";
import { Container } from 'react-bootstrap';
import axios from 'axios';

const AddChapter = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [volumes, setVolumes] = useState([]);
  const [selectedVolume, setSelectedVolume] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/catalog/books/${slug}/volumes/`);
        setVolumes(response.data);
      } catch (error) {
        console.error('Error fetching volumes:', error);
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

      const volumeId = selectedVolume ? selectedVolume : null;
      
      console.log('Отправка данных главы:', {
        title,
        isPaid,
        volumeId
      });
      
      await apiUploadChapter(slug, title, file, isPaid, volumeId);
      
      setTitle('');
      setFile(null);
      setIsPaid(false);
      setSelectedVolume('');
      
      alert('Глава успешно загружена');
      
    } catch (error) {
      setError(error.message || 'Произошла ошибка при загрузке главы');
      console.error('Error creating chapter:', error);
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

              <button type="submit">Добавить главу</button>
            </form>
          </div>
        </Container>
      </Container>
    </section>
  );
};

export default AddChapter;
