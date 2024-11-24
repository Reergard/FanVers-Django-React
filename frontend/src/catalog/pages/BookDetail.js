import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBook, getChapterList, updateChapterStatus } from '../api';
import "../css/Catalog.css";
import { Container } from 'react-bootstrap';
import RatingBar from '../../rating/RatingBar';
import BookComments from '../../reviews/components/BookComments'; 
import BookmarkButton from '../../navigation/components/BookmarkButton'; 
import axios from 'axios';
import { updateChapterOrder } from '../../editors/api';


const BookDetail = () => {
  const { slug } = useParams();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [volumeTitle, setVolumeTitle] = useState('');
  const [volumeError, setVolumeError] = useState('');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [chapterPositions, setChapterPositions] = useState({});
  const [chapterStatuses, setChapterStatuses] = useState({});

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/users/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    },
    enabled: !!isAuthenticated && !!token
  });

  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => fetchBook(slug),
    enabled: !!slug,
  });

  const { data: chapters = [], isLoading: chaptersLoading, error: chaptersError } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      try {
        const response = await getChapterList(slug);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!slug,
    retry: 1
  });

  const { data: volumes = [] } = useQuery({
    queryKey: ['volumes', slug],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8000/api/catalog/books/${slug}/volumes/`);
      return response.data;
    },
    enabled: !!slug,
  });

  const groupChaptersByVolume = (chapters, volumes) => {
    const grouped = new Map();
    
    // Создаем группу для глав без тома
    grouped.set(null, []);
    
    // Инициализируем группы для каждого тома
    volumes.forEach(volume => {
      grouped.set(volume.id, []);
    });
    
    // Распределяем главы по томам
    chapters.forEach(chapter => {
      const volumeId = chapter.volume;
      
      if (volumeId && volumes.some(v => v.id === volumeId)) {
        grouped.get(volumeId).push(chapter);
      } else {
        grouped.get(null).push(chapter);
      }
    });
    
    // Удаляем пустые группы
    for (const [key, value] of grouped.entries()) {
      if (value.length === 0) {
        grouped.delete(key);
      }
    }
    
    return grouped;
  };

  const handlePurchaseChapter = async (chapterId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/purchase-chapter/${chapterId}/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
        
      // Обновляем данные после успешной покупки
      queryClient.invalidateQueries(['chapters', slug]);
      queryClient.invalidateQueries(['profile']);
      
    } catch (error) {
      if (error.response?.status === 400) {
        if (error.response.data.error === 'Недостатній баланс') {
          alert('Баланс ваших Доступних розділів для відкриття досяг 0. Аби мати змогу купувати закриті розділи вам слід поповнити Доступні розділи на сторінці Профіля');
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('Произошла ошибка при покупке главы');
      }
    }
  };

  const handleCreateVolume = async (e) => {
    e.preventDefault();
    setVolumeError('');

    try {
      const response = await axios.post(
        `http://localhost:8000/api/catalog/books/${slug}/volumes/`,
        { title: volumeTitle },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Очищаем форму и скрываем её
      setVolumeTitle('');
      setShowVolumeForm(false);
      
      // Обновляем список томов
      queryClient.invalidateQueries(['volumes', slug]);
      
      alert('Том успішно створено');
    } catch (error) {
      setVolumeError(error.response?.data?.error || 'Помилка при створенні тому');
    }
  };

  // Общая функция для обновления позиций
  const updateChapterPositions = async (updates) => {
    try {
      const newPositions = { ...chapterPositions };
      updates.forEach(update => {
        newPositions[update.chapter_id] = update.position;
      });
      setChapterPositions(newPositions);
      
      await updateChapterOrder('no-volume', updates);
      await queryClient.invalidateQueries(['chapters', slug]);
    } catch (error) {
      alert('Помилка при оновленні позицій глав');
      throw error;
    }
  };

  // Функция для перемещения главы
  const moveChapter = async (volumeId, chapterId, direction) => {
    try {
      const currentChapter = chapters.find(ch => ch.id === chapterId);
      const volumeChapters = chapters.filter(ch => ch.volume === volumeId)
        .sort((a, b) => a.position - b.position);
      const currentIndex = volumeChapters.findIndex(ch => ch.id === chapterId);
      const sortedVolumes = volumes.sort((a, b) => a.id - b.id);
      const currentVolumeIndex = sortedVolumes.findIndex(v => v.id === volumeId);
      
      let orderData = null;

      if (direction === 'down') {
        if (currentIndex < volumeChapters.length - 1) {
          // Перемещение вниз внутри тома
          // Пересчитываем позиции для всех глав в томе
          const updatedChapters = volumeChapters.map((chapter, index) => {
            if (index === currentIndex) {
              return {
                chapter_id: chapter.id,
                position: (currentIndex + 2), // Новая позиция текущей главы
                volume_id: volumeId
              };
            } else if (index === currentIndex + 1) {
              return {
                chapter_id: chapter.id,
                position: (currentIndex + 1), // Позиция главы, с которой меняемся
                volume_id: volumeId
              };
            } else {
              return {
                chapter_id: chapter.id,
                position: index + 1, // Сохраняем существующий порядок для остальных
                volume_id: volumeId
              };
            }
          });
          
          orderData = updatedChapters;
        } else if (currentVolumeIndex < sortedVolumes.length - 1) {
          // Перемещение в следующий том
          const nextVolume = sortedVolumes[currentVolumeIndex + 1];
          const nextVolumeChapters = chapters.filter(ch => ch.volume === nextVolume.id)
            .sort((a, b) => a.position - b.position);
          
          // Устанавливаем позицию 1 для перемещаемой главы
          orderData = [{
            chapter_id: chapterId,
            position: 1,
            volume_id: nextVolume.id
          }];
          
          // Сдвигаем все существующие главы следующего тома на одну позицию вперед
          if (nextVolumeChapters.length > 0) {
            const shiftedChapters = nextVolumeChapters.map(chapter => ({
              chapter_id: chapter.id,
              position: chapter.position + 1,
              volume_id: nextVolume.id
            }));
            
            // Добавляем обновленные позиции всех глав в orderData
            orderData = [...orderData, ...shiftedChapters];
          }
        }
      } else if (direction === 'up') {
        if (currentIndex > 0) {
          // Перемещение вверх внутри тома
          const updatedChapters = volumeChapters.map((chapter, index) => {
            if (index === currentIndex) {
              return {
                chapter_id: chapter.id,
                position: currentIndex, // Новая позиция текущей главы
                volume_id: volumeId
              };
            } else if (index === currentIndex - 1) {
              return {
                chapter_id: chapter.id,
                position: currentIndex + 1, // Позиция главы, с которой меняемся
                volume_id: volumeId
              };
            } else {
              return {
                chapter_id: chapter.id,
                position: index + 1, // Сохраняем существующий порядок для остальных
                volume_id: volumeId
              };
            }
          });
          
          orderData = updatedChapters;
        } else if (currentVolumeIndex > 0) {
          // Перемещение в предыдущий том
          const prevVolume = sortedVolumes[currentVolumeIndex - 1];
          const prevVolumeChapters = chapters.filter(ch => ch.volume === prevVolume.id)
            .sort((a, b) => a.position - b.position);
          
          const newPosition = prevVolumeChapters.length > 0 
            ? prevVolumeChapters[prevVolumeChapters.length - 1].position + 1
            : 1;
          
          orderData = [{
            chapter_id: chapterId,
            position: newPosition,
            volume_id: prevVolume.id
          }];
        }
      }

      if (orderData) {
        await updateChapterPositions(orderData);
      }
    } catch (error) {
      alert('Помилка при зміні порядку глав');
    }
  };

  // Обработчик изменения позиции через input
  const handlePositionChange = async (chapterId, newPosition, volumeId) => {
    try {
      // Получаем все главы текущего тома
      const volumeChapters = chapters
        .filter(ch => ch.volume === volumeId)
        .sort((a, b) => a.position - b.position);
      
      const currentChapter = volumeChapters.find(ch => ch.id === chapterId);
      const targetPosition = Number(newPosition);
      const currentPosition = currentChapter.position;
      
      // Формируем массив обновлений для всех затронутых глав
      let updates = [];
      
      if (targetPosition > currentPosition) {
        // Перемещение вниз: сдвигаем главы между текущей и целевой позицией вверх
        updates = volumeChapters
          .filter(ch => ch.position > currentPosition && ch.position <= targetPosition)
          .map(ch => ({
            chapter_id: ch.id,
            position: ch.position - 1,
            volume_id: volumeId
          }));
      } else if (targetPosition < currentPosition) {
        // Перемещение вверх: сдвигаем главы между целевой и текущей позицией вниз
        updates = volumeChapters
          .filter(ch => ch.position >= targetPosition && ch.position < currentPosition)
          .map(ch => ({
            chapter_id: ch.id,
            position: ch.position + 1,
            volume_id: volumeId
          }));
      }

      // Добавляем обновление для перемещаемой главы
      updates.push({
        chapter_id: chapterId,
        position: targetPosition,
        volume_id: volumeId
      });

      await updateChapterPositions(updates);
      
    } catch (error) {
      alert('Помилка при зміні позиції глави');
    }
  };

  const handleChapterStatusChange = async (chapterId, isPaid) => {
    try {
        await updateChapterStatus(chapterId, isPaid);
        // Обновляем локальное состояние
        setChapterStatuses(prev => ({
            ...prev,
            [chapterId]: isPaid
        }));
        // Обновляем список глав
        queryClient.invalidateQueries(['chapters', slug]);
    } catch (error) {
        alert('Помилка при зміні статусу глави');
    }
  };

  if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;
  if (bookError) return <div>Помилка: {bookError.message}</div>;
  if (chaptersError) {
    return <div>Помилка завантаження розділів: {chaptersError.message}</div>;
  }
  if (chaptersLoading) {
    return <div>Завантаження...</div>;
  }
  if (!book) return <div>Книгу не знайдено</div>;

  return (
    <section className="book-detail">
      <Container fluid className="catalog-section" id="catalog">
        <Container className="catalog-content">
          <h1>{book.title}</h1>

          {/* Добавляем кнопку редактирования сразу после заголовка */}
          <div className="book-controls">
            {isAuthenticated && (
              <>
                <BookmarkButton bookId={book.id} />
                <button 
                  className="edit-order-btn"
                  onClick={() => setIsEditingOrder(!isEditingOrder)}
                >
                  {isEditingOrder ? 'Завершити редагування' : 'Редагувати порядок розділів'}
                </button>
              </>
            )}
          </div>

          {/* Изображение книги */}
          {book.image && (
            <img 
              src={`http://localhost:8000${book.image}`}
              alt={book.title} 
              className="book-image" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          )}

          <p>{book.description}</p>

          <h2>Розділи:</h2>
          {volumes.length > 0 ? (
            <div className="chapters-list">
              {/* Отображаем все тома по порядку */}
              {volumes.map((volume) => {
                const volumeChapters = chapters.filter(ch => ch.volume === volume.id)
                  .sort((a, b) => a.position - b.position);
                
                return (
                  <div key={volume.id} className="volume-chapters">
                    <h3 className="volume-title">{volume.title}</h3>
                    <div className="chapters-list">
                      {volumeChapters.map((chapter) => {
                        return (
                          <div key={chapter.id} className="chapter-item">
                            {isEditingOrder ? (
                              <>
                                <input
                                  type="number"
                                  value={chapterPositions[chapter.id] || chapter.position}
                                  onChange={(e) => {
                                    const newPositions = {
                                      ...chapterPositions,
                                      [chapter.id]: Number(e.target.value)
                                    };
                                    setChapterPositions(newPositions);
                                  }}
                                  onBlur={(e) => handlePositionChange(chapter.id, e.target.value, chapter.volume)}
                                  style={{ width: '60px', marginRight: '10px' }}
                                />
                                <button onClick={() => moveChapter(chapter.volume, chapter.id, 'up')}>↑</button>
                                <button onClick={() => moveChapter(chapter.volume, chapter.id, 'down')}>↓</button>
                              </>
                            ) : (
                              <span className="chapter-position">{chapter.position}.</span>
                            )}
                            {chapter.title}
                            <div className="chapter-actions">
                              {chapter.is_paid && !chapter.is_purchased ? (
                                isAuthenticated ? (
                                  <button 
                                    onClick={() => handlePurchaseChapter(chapter.id)}
                                    disabled={profile?.balance <= 0}
                                    className="purchase-btn"
                                  >
                                    Купити
                                  </button>
                                ) : (
                                  <Link to="/login" className="login-btn">
                                    Увійти для читання
                                  </Link>
                                )
                              ) : (
                                <Link 
                                  to={`/books/${slug}/chapters/${chapter.slug}`}
                                  className="read-btn"
                                >
                                  Читати
                                </Link>
                              )}
                              
                              <div className="chapter-edit-controls">
                                <Link 
                                  to={`/chapters/${chapter.id}/edit`} 
                                  className="edit-chapter-btn"
                                >
                                  Редагувати
                                </Link>
                                <label className="chapter-status-toggle">
                                  <input
                                    type="checkbox"
                                    checked={chapterStatuses[chapter.id] ?? chapter.is_paid}
                                    onChange={(e) => handleChapterStatusChange(chapter.id, e.target.checked)}
                                  />
                                  Закритий доступ
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Отдельный блок для глав без тома */}
              {chapters.filter(ch => !ch.volume).length > 0 && (
                <div className="volume-chapters">
                  <h3 className="volume-title">Розділи без тому</h3>
                  <div className="chapters-list">
                    {chapters
                      .filter(ch => !ch.volume)
                      .sort((a, b) => a.position - b.position)
                      .map((chapter) => (
                        <div key={chapter.id} className="chapter-item">
                          {isEditingOrder ? (
                            <>
                              <input
                                type="number"
                                value={chapterPositions[chapter.id] || chapter.position}
                                onChange={(e) => {
                                  const newPositions = {
                                    ...chapterPositions,
                                    [chapter.id]: Number(e.target.value)
                                  };
                                  setChapterPositions(newPositions);
                                }}
                                onBlur={(e) => handlePositionChange(chapter.id, e.target.value, chapter.volume)}
                                style={{ width: '60px', marginRight: '10px' }}
                              />
                              <button onClick={() => moveChapter(chapter.volume, chapter.id, 'up')}>↑</button>
                              <button onClick={() => moveChapter(chapter.volume, chapter.id, 'down')}>↓</button>
                            </>
                          ) : (
                            <span className="chapter-position">{chapter.position}.</span>
                          )}
                          {chapter.title}
                          <div className="chapter-actions">
                            {chapter.is_paid && !chapter.is_purchased ? (
                              isAuthenticated ? (
                                <button 
                                  onClick={() => handlePurchaseChapter(chapter.id)}
                                  disabled={profile?.balance <= 0}
                                  className="purchase-btn"
                                >
                                  Купити
                                </button>
                              ) : (
                                <Link to="/login" className="login-btn">
                                  Увійти для читання
                                </Link>
                              )
                            ) : (
                              <Link 
                                to={`/books/${slug}/chapters/${chapter.slug}`}
                                className="read-btn"
                              >
                                Читати
                              </Link>
                            )}
                            
                            <div className="chapter-edit-controls">
                              <Link 
                                to={`/chapters/${chapter.id}/edit`} 
                                className="edit-chapter-btn"
                              >
                                Редагувати
                              </Link>
                              <label className="chapter-status-toggle">
                                <input
                                  type="checkbox"
                                  checked={chapterStatuses[chapter.id] ?? chapter.is_paid}
                                  onChange={(e) => handleChapterStatusChange(chapter.id, e.target.checked)}
                                />
                                Закритий доступ
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Немає доступних томів</p>
          )}
          

          <div className="volume-section">
            <button onClick={() => setShowVolumeForm(!showVolumeForm)}>
              {showVolumeForm ? 'Скасувати' : 'Створити том'}
            </button>

            {showVolumeForm && (
              <form onSubmit={handleCreateVolume} className="volume-form">
                {volumeError && <p className="error">{volumeError}</p>}
                <div>
                  <label htmlFor="volumeTitle">Назва тому:</label>
                  <input
                    type="text"
                    id="volumeTitle"
                    value={volumeTitle}
                    onChange={(e) => setVolumeTitle(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Зберегти</button>
              </form>
            )}
          </div>

          <Link to={`/books/${book.slug}/add-chapter`}>
            <button>Додати розділ</button>
          </Link>




              {/* Компонент рейтінгу */}
              <RatingBar bookSlug={slug} />

               {/* Компонент коментарів */}
               {book && (
                  <BookComments bookSlug={book.slug} isAuthenticated={isAuthenticated} />
                )}

        
        </Container>
      </Container>
    </section>
  );
};

export default BookDetail;