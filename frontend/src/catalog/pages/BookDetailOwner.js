import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { navigationAPI } from '../../api/navigation/navigationAPI';
import axios from 'axios';
import BookDetailReader from './BookDetailReader';
import ChapterRangeSelector from '../../navigation/components/ChapterRangeSelector';
import { BreadCrumb } from '../../main/components/BreadCrumb';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from "../css/BookDetailRouter.module.css";
import BookCart from "./img/image__book-cart.png";
import { Button } from 'react-bootstrap';
import SettingsBook from './img/Setting.svg';
import { Form } from 'react-bootstrap';
import { useToast } from '../../components/CustomToast';

import AuthorBook from "./img/author.svg";
import bookMini from "./img/book-mini.svg";
import LeftArrow from '../../main/pages/img/left-arrow.png';
import RightArrow from '../../main/pages/img/right-arrow.png';
import OrangeDot from '../../main/pages/img/orange-dot.png';
import BlueDot from '../../main/pages/img/blue-dot.png';
import Slider from "react-slick";
// import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { mainAPI } from '../../api/main/mainAPI';
import { reviewsAPI } from '../../api/reviews/reviewsAPI';
import Edit from "./img/edit.svg";
import Read from "./img/read.png";
import Trash from "./img/Trash.svg";
import CommentImg from '../../main/pages/img/comment.jpg';
import Favorite from '../../main/pages/img/Favorite.png';
import LeftFooter from "./img/left-footer.svg";
import RightFooter from "./img/right-footer.svg";
import TranslationSettingsButton from '../components/TranslationSettingsButton';
import AdultIcon from '../pages/img/18.svg';
import ghostFull from '../../assets/images/icons/ghost_full.png';
import ghost from '../../assets/images/icons/ghost.png';

// Імпортуємо функції з bookUtils
import { 
    getTranslationStatusLabel, 
    getOriginalStatusLabel,
    getBookTypeLabel 
} from '../utils/bookUtils';
import BookRatingComponent from '../../rating/components/BookRatingComponent';



const NovelCard = ({ title, description, image, book_type, adult_content }) => {
  const imageUrl = image ? (image.startsWith('http') ? image : `http://127.0.0.1:8000${image}`) : '';
  
  return (
    <div className="novel-card" style={{ background: "none", minHeight: "auto", height: "min-content" }}>
      <div className="novel-cover">
        <div className="image-container">
          <div className="image-wrapper">
            <img
              src={imageUrl}
              alt={title}
              className="novel-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            {adult_content && (
              <img src={AdultIcon} alt="18+" className="novel-adult-icon" />
            )}
                          <div
                className="divider"
                role="separator"
                aria-orientation="vertical"
              />
              {book_type === 'AUTHOR' && (
                <span className="novel-letter">a</span>
              )}
          </div>
        </div>
      </div>
      <span className={`novel-title-homepage ${styles.novelTitleHomepage}`}>{title}</span>
    </div>
  );
};
const ExpandableTags = ({ title, className, items }) => {
  const [expanded, setExpanded] = useState(false);

  // Handle both string arrays and object arrays from API
  const processedItems = items?.map(item => {
    if (typeof item === 'string') return item;
    return item?.name || item?.title || item?.label || item?.slug || '';
  }).filter(Boolean) || [];

  if (!processedItems || processedItems.length === 0) {
    return (
      <div className={className}>
        {title && <span>{title}:</span>}
        <div className={`name-${className.split(" ")[0]}`}>
          <span>—</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <span>{title}:</span>}
      <div className={`name-${className.split(" ")[0]}`}>
        {processedItems.slice(0, 2).map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {processedItems.length > 2 && (
          <button className={`expand-btn ${styles.expandBtn}`} onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲" : "▼"}
          </button>
        )}
        {expanded &&
          processedItems
            .slice(2)
            .map((item, index) => <span key={index + 2}>{item}</span>)}
      </div>
    </div>
  );
};

const CommentComponent = ({ comment, onReply, onReaction, onOwnerLike, isOwner, currentUser, getUserImage, formatDate, showReplyForm, setShowReplyForm, replyText, setReplyText, handleReplySubmit }) => {
  const [localShowReplyForm, setLocalShowReplyForm] = useState(false);

  const handleReplyClick = () => {
    setLocalShowReplyForm(!localShowReplyForm);
    setShowReplyForm(comment.id);
  };

  const handleLocalReplySubmit = (e) => {
    handleReplySubmit(e, comment);
  };

  // Определяем, является ли это ответом на комментарий
  const isReply = comment.parent !== null;

  return (
    <>
      <div className={isReply ? styles.commentBlockReply : styles.commentBlock}>
        <img className={styles.userImg} src={getUserImage(comment.user)} alt="User" />
        <div className={styles.allTextComment}>
          <div className={styles.infoUserComment}>
            <div className={styles.nameUserComment}>{comment.user?.username || 'Невідомий користувач'}</div>
            <div className={styles.lastSeen}>{formatDate(comment.created_at)}</div>
          </div>
          <div className={styles.contentComment}>{comment.text}</div>
          <div className={styles.buttonComment}>
            <div className={styles.leftButtonComment}>
              <button onClick={() => onReaction(comment.id, 'like')}>
                {comment.user_reaction === 'like' ? '❤️' : '🤍'} Лайк
              </button>
              <span>{comment.likes_count || 0}</span>
              <button onClick={() => onReaction(comment.id, 'dislike')}>
                {comment.user_reaction === 'dislike' ? '💔' : '🖤'} Дизлайк
              </button>
              <span>{comment.dislikes_count || 0}</span>
              <button onClick={handleReplyClick}>Відповісти</button>
            </div>
            <div className={styles.rightButtonComment}>
              {isOwner && (
                <button onClick={() => onOwnerLike(comment.id)}>
                  {comment.has_owner_like ? '✅' : '⭐'} {comment.owner_like_type || 'Автора'}
                </button>
              )}
              {currentUser?.id === comment.user?.id && (
                <>
                  <img src={Trash} alt="Delete" />
                  <button>Видалити коментар</button>
                </>
              )}
            </div>
          </div>
        </div>
        <img className={styles.LeftFooter} src={LeftFooter} alt="Left footer" />
        <img className={styles.RightFooter} src={RightFooter} alt="Right footer" />
      </div>
      
      {/* Форма ответа */}
      {localShowReplyForm && (
        <div className={styles.replyForm}>
          <input
            placeholder="Відповісти на коментар..."
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button onClick={handleLocalReplySubmit}>
            <img src={RightArrow} alt="Submit" />
          </button>
        </div>
      )}
      
      {/* Рекурсивно отображаем ответы */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReaction={onReaction}
              onOwnerLike={onOwnerLike}
              isOwner={isOwner}
              currentUser={currentUser}
              getUserImage={getUserImage}
              formatDate={formatDate}
              showReplyForm={showReplyForm}
              setShowReplyForm={setShowReplyForm}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </>
  );
};

const BookDetailOwner = ({ volumes = [], books = [] }) => {

  const { slug } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  const { error: showError, success } = useToast();
  const queryClient = useQueryClient();
  const [currentStartChapter, setCurrentStartChapter] = useState(1);
  const sliderRef = useRef(null);
  
  // Состояние для комментариев
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(null);
  
  // Состояние для модального окна создания тома
  const [isCreateVolumeModalOpen, setIsCreateVolumeModalOpen] = useState(false);
  
  // Состояние для режима изменения порядка глав
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [chapterPositions, setChapterPositions] = useState({});
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Load book data
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Debug logging for book data
  useEffect(() => {
    if (book) {
      console.log('BookDetailOwner: Book data loaded:', {
        id: book.id,
        title: book.title,
        genres: book.genres,
        tags: book.tags,
        fandoms: book.fandoms,
        country: book.country
      });
    }
  }, [book]);

  // Load chapters data - exactly like in working code
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['paginatedChapters', book?.id, currentStartChapter],
    queryFn: () => navigationAPI.getPaginatedChapters(book.id, currentStartChapter),
    enabled: !!book?.id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  // Load chapters list for owner table - exactly like in working code
  const { data: chapterList = [] } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      try {
        const response = await catalogAPI.getChapterList(slug);
        console.log('Chapters loaded for owner:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error loading chapters:', error);
        return [];
      }
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  // Volumes теперь загружаются в BookDetailRouter и передаются как props

  // Other books теперь загружаются в BookDetailRouter и передаются как props

  // Load comments for the book
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['book-comments', slug],
    queryFn: async () => {
      try {
        const commentsData = await reviewsAPI.fetchBookComments(slug);
        console.log('Comments loaded:', commentsData);
        return commentsData;
      } catch (error) {
        console.error('Error loading comments:', error);
        return [];
      }
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // trackView теперь вызывается в BookDetailRouter, убираем дублирование

  const handleRangeSelect = (startChapter) => {
    setCurrentStartChapter(startChapter);
  };

  // Обработчики для модального окна создания тома
  const handleCreateVolumeClick = () => {
    setIsCreateVolumeModalOpen(true);
  };

  const handleCloseCreateVolumeModal = () => {
    setIsCreateVolumeModalOpen(false);
  };

  const handleCreateVolume = async (volumeTitle) => {
    try {
      await catalogAPI.createVolume(slug, volumeTitle);
      success('Том успішно створено');
      
      // Обновляем кеш томов
      queryClient.invalidateQueries(['volumes', slug]);
    } catch (error) {
      console.error('Error creating volume:', error);
      showError(error.message || 'Помилка при створенні тому');
      throw error; // Перебрасываем ошибку для ConfirmationModal
    }
  };

  // Функции для работы с порядком глав
  const handleToggleReorderMode = () => {
    if (!isReorderMode) {
      // Включаем режим изменения порядка
      const positions = {};
      chapterList.forEach((chapter, index) => {
        positions[chapter.id] = chapter.position || (index + 1);
      });
      setChapterPositions(positions);
    } else {
      // Отключаем режим изменения порядка
      setChapterPositions({});
    }
    setIsReorderMode(!isReorderMode);
  };

  const handlePositionChange = (chapterId, newPosition) => {
    setChapterPositions(prev => ({
      ...prev,
      [chapterId]: parseFloat(newPosition) || 0
    }));
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      // Группируем главы по томам
      const volumeGroups = {};
      chapterList.forEach(chapter => {
        const volumeId = chapter.volume || 'no-volume';
        if (!volumeGroups[volumeId]) {
          volumeGroups[volumeId] = [];
        }
        volumeGroups[volumeId].push({
          chapter_id: chapter.id,
          position: chapterPositions[chapter.id] || chapter.position,
          volume_id: chapter.volume
        });
      });

      // Обновляем порядок для каждого тома
      for (const [volumeId, chapters] of Object.entries(volumeGroups)) {
        if (chapters.length > 0) {
          await catalogAPI.updateChapterOrder(volumeId, chapters);
        }
      }

      // Обновляем данные
      queryClient.invalidateQueries(['chapters', slug]);
      success('Порядок глав успешно обновлен');
      setIsReorderMode(false);
      setChapterPositions({});
    } catch (error) {
      console.error('Error saving chapter order:', error);
      showError('Ошибка при сохранении порядка глав: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCancelReorder = () => {
    setIsReorderMode(false);
    setChapterPositions({});
  };

  // Функции для работы с комментариями
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    try {
      await reviewsAPI.postBookComment(slug, commentText);
      setCommentText('');
      refetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      
      // Показываем уведомление об ошибке доступа
      if (error.response?.status === 403) {
        showError(error.response?.data?.detail || 'У вас немає прав для коментування цієї книги');
      } else {
        showError('Помилка при відправці коментаря: ' + (error.message || 'Невідома помилка'));
      }
    }
  };

  const handleReplySubmit = async (e, parentComment) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    try {
      await reviewsAPI.postBookComment(slug, replyText, parentComment.id);
      setReplyText('');
      setReplyingTo(null);
      setShowReplyForm(null);
      refetchComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      
      // Показываем уведомление об ошибке доступа
      if (error.response?.status === 403) {
        showError(error.response?.data?.detail || 'У вас немає прав для коментування цієї книги');
      } else {
        showError('Помилка при відправці відповіді: ' + (error.message || 'Невідома помилка'));
      }
    }
  };

  const handleReaction = async (commentId, action) => {
    if (!currentUser) return;

    try {
      await reviewsAPI.updateReaction(commentId, 'book', action);
      refetchComments();
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleOwnerLike = async (commentId) => {
    if (!currentUser || !isOwner) return;

    try {
      await reviewsAPI.updateOwnerLike(commentId, 'book');
      refetchComments();
    } catch (error) {
      console.error('Error updating owner like:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'менше години тому';
    if (diffInHours === 1) return '1 годину тому';
    if (diffInHours < 24) return `${diffInHours} годин тому`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 день тому';
    if (diffInDays < 7) return `${diffInDays} днів тому`;
    
    return date.toLocaleDateString('uk-UA');
  };

  const getUserImage = (user) => {
    if (user?.profile_image) {
      return user.profile_image.startsWith('http') 
        ? user.profile_image 
        : `http://127.0.0.1:8000${user.profile_image}`;
    }
    return ghostFull;
  };

  if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;
  if (bookError) return <div>Помилка: {bookError.message}</div>;
  if (!book) return <div>Книгу не знайдено</div>;

  const isOwner = currentUser && book.owner === currentUser.id;

  // Check if user is owner like in working code
  if (!isOwner) {
    return <div>У вас немає прав для перегляду цієї сторінки</div>;
  }

  // Prepare dynamic data - exactly like in working code
  const title = book.title || '—';
  const imageUrl = book.image ? (book.image.startsWith('http') ? book.image : `http://127.0.0.1:8000${book.image}`) : BookCart;
  
  // Author - exactly like in working code
  const authorName = book.author?.name || book.author_username || book.creator_username || book.owner_username || '—';
  
  // Translator - exactly like in working code  
  const translatorName = book.translator?.name || book.translator_username || book.creator_username || '—';
  
  // Chapters count - properly calculated from available data
  const chaptersCount = book.chapters_count || chapterList?.length || 0;
  
  // Genres, tags, fandoms - properly extracted from API response
  const genres = book.genres || [];
  const tags = book.tags || [];
  const fandoms = book.fandoms || [];
  
  // Country - properly extracted from API response
  const country = book.country?.name || '—';
  
  // Status fields - properly extracted from API response
  const translationStatus = book.book_type === 'TRANSLATION' ? 
                           (book.translation_status_display || getTranslationStatusLabel(book.translation_status)) : 
                           '—';
  
  const originalStatus = book.original_status_display || getOriginalStatusLabel(book.original_status);
  
  const bookTypeLabel = getBookTypeLabel(book.book_type);
  const adult = !!book.adult_content;

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    dots: false,
    responsive: [
      {
        breakpoint: 745,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 515,
        settings: {
          slidesToShow: 2,
        },
      },
   
    ],
  };
  return (
    <>
      <BreadCrumb items={[
        { href: "/", label: "Головна" },
        { href: `/books/${slug}`, label: title || "Назва книги" },
      ]} />
      <div className={styles.BookDetailContainer}>


        <div className={styles.headerTableInfoBook}>
          <p>/</p> <span>{title}</span>
        </div>
        <div className={styles.headerBookDetail}>
          <div className={styles.BookCartContainer}>
            <div className={`novel-image ${styles.CartBook}`}>
              <img src={imageUrl} alt={title} />
              {adult && <img src={AdultIcon} alt="18+" className={styles.adultIcon} />}
            </div>
            <div className={styles.footerBookCartUser}>
              <TranslationSettingsButton bookSlug={slug} />
            </div>

          </div>
          <div className={styles.tableBookMobile}>
            <div className={styles.leftMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Автор:</span>
                <p>{authorName}</p>
              </div>
            </div>
            <div className={styles.rightMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Перекладач:</span>
                <p>{translatorName}</p>
              </div>
            </div>
            <div className={styles.leftMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Розділів:</span>
                <p>{chaptersCount}</p>
              </div>
            </div>
            <div className={styles.rightMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Статус перекладу:</span>
                <p>{translationStatus}</p>
              </div>
            </div>
            <div className={styles.leftMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Країна:</span>
                <p>{country}</p>
              </div>
            </div>
            <div className={styles.rightMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Статус випуску твору:</span>
                <p>{originalStatus}</p>
              </div>
            </div>
            <div className={styles.leftMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Жанри:</span>
                <p>
                  {genres && genres.length > 0 
                    ? genres.slice(0, 2).map(g => g.name || g).join(', ')
                    : '—'
                  }
                </p>
              </div>
            </div>
            <div className={styles.rightMobile}>
              <div className={styles.tableBookMobileBlock}>
                <span>Теги:</span>
                <p>
                  {tags && tags.length > 0 
                    ? tags.slice(0, 2).map(t => t.name || t).join(', ')
                    : '—'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className={styles.anotherInfoBook}>
            <div className={styles.mainInfoBook}>
              <div className={styles.tableInfoBook}>


                <table className={styles.tableBook}>
                  <tbody>
                    <tr>
                      <td>Автор:</td>
                      <td>{authorName}</td>
                    </tr>
                    <tr>
                      <td>Перекладач:</td>
                      <td>{translatorName}</td>
                    </tr>
                    <tr>
                      <td>Розділів:</td>
                      <td>{chaptersCount}</td>
                    </tr>
                    <tr>
                      <td>Жанри:</td>
                      <td>
                        <ExpandableTags
                          title=""
                          className={`genres ${styles.genres}`}
                          items={genres}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Теги:</td>
                      <td>
                        <ExpandableTags
                          title=""
                          className={`tags ${styles.tags}`}
                          items={tags}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Фендом:</td>
                      <td>
                        <ExpandableTags
                          title=""
                          className={`fandom ${styles.fandom}`}
                          items={fandoms}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Країна:</td>
                      <td>{country}</td>
                    </tr>
                    <tr>
                      <td>Статус перекладу:</td>
                      <td>{translationStatus}</td>
                    </tr>
                    <tr>
                      <td>Статус випуску твору:</td>
                      <td>{originalStatus}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.rightInfoBook}>
                <div className={styles.thanks}>
                  <div className={styles.fanCoins}>
                    <span>10</span>
                    <p>FanCoins</p>
                  </div>
                  <div className={styles.spanThanks}>
                    подякувати автору
                  </div>
                </div>
                <div className={styles.raiting}>
                  <BookRatingComponent
                    key={`book-rating-${slug}`}
                    bookSlug={slug}
                    ratingType="BOOK"
                    title="Рейтинг твору:"
                    onRatingUpdate={() => {
                      // Можно добавить дополнительную логику при обновлении рейтинга
                      console.log('Рейтинг твору оновлено');
                    }}
                  />
                  {book.book_type === 'TRANSLATION' && (
                    <BookRatingComponent
                      key={`translation-rating-${slug}`}
                      bookSlug={slug}
                      ratingType="TRANSLATION"
                      title="Якість перекладу:"
                      onRatingUpdate={() => {
                        // Можно добавить дополнительную логику при обновлении рейтинга
                        console.log('Рейтинг перекладу оновлено');
                      }}
                    />
                  )}
                </div>
                {book.book_type === 'AUTHOR' && (
                  <img src={AuthorBook} alt="Author book" />
                )}
              </div>
            </div>
            <button className={styles.translators}>
              <img src={bookMini} alt="Book mini" />
              <span>Стати новим перекладачем</span>
            </button>
          </div>

        </div>
        <div className={styles.descBookDetail}>
          <div className={styles.headerDescBook}>
            <span>Опис книги:</span>
            <div className={styles.lineHeaderDesc}></div>
          </div>
          <p>{book.description || 'Опис книги відсутній'}</p>
        </div>
        <div className={styles.anotherBooks}>
          <div className={styles.headerAnotherBooks}>
            <span>Інші роботи автора</span>
            <div className={styles.lineAnotherBooks}></div>
          </div>
          <div className={styles.contentAnotherBooks}>
            <div className="novels-slider-wrapper">
              {books?.length > 0 ? (<>

                <Slider ref={sliderRef} {...settings}>
                  {books.map((ad) => (
                    <NovelCard
                      key={ad.id}
                      title={ad.title}
                      description={ad.description}
                      image={ad.image}
                      book_type={ad.book_type}
                      adult_content={ad.adult_content}
                    />
                  ))}
                </Slider>
                <div className="slider-controls" style={{ padding: "0" }}>
                  <button
                    className="slider-btn left"
                    onClick={() => sliderRef.current.slickPrev()}
                  >
                    <img src={LeftArrow} alt="Left arrow" />
                    <img src={BlueDot} alt="Blue dot" />
                  </button>
                  <button
                    className="slider-btn right"
                    onClick={() => sliderRef.current.slickNext()}
                  >
                    <img src={OrangeDot} alt="Orange dot" />
                    <img src={RightArrow} alt="Right arrow" />
                  </button>
                </div>
              </>
              ) : (
                <div className="no-books-message">Немає доступних книг</div>
              )}

            </div>

          </div>
        </div>
        <div className={styles.chaptersBooks}>
          <div className={styles.headerChapters}>
            <div className={styles.leftHeaderChapters}>
              <Link to={`/books/${slug}/add-chapter`} className={styles.bookmarks}>
                Додати розділ
              </Link>
              <button onClick={handleCreateVolumeClick} className={styles.bookmarks}>
                Створити том
              </button>
            </div>
            <div className={styles.rightHeaderChapters}>
              {!isReorderMode ? (
                <button onClick={handleToggleReorderMode} className={styles.bookmarks}>
                  Змінити порядок розділів
                </button>
              ) : (
                <div className="reorder-controls">
                  <button 
                    onClick={handleSaveOrder} 
                    disabled={isSavingOrder}
                    className={styles.bookmarks}
                  >
                    {isSavingOrder ? 'Збереження...' : 'Підтвердити зміну'}
                  </button>
                  <button 
                    onClick={handleCancelReorder}
                    className={styles.bookmarks}
                  >
                    Скасувати
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* <div className={styles.containerChapters}> */}
          <div className={isReorderMode ? 'reorder-mode' : ''}>
            {chapterList && chapterList.length > 0 ? (
              (() => {
                // Группируем главы по томам
                const groupedChapters = {};
                const sortedChapters = chapterList
                  .slice()
                  .sort((a, b) => {
                    // Сначала сортируем по наличию тома (тома идут первыми)
                    if (a.volume && !b.volume) return -1;
                    if (!a.volume && b.volume) return 1;
                    // Затем по ID тома
                    if (a.volume && b.volume) {
                      if (a.volume !== b.volume) return a.volume - b.volume;
                    }
                    // Затем по позиции
                    return a.position - b.position;
                  });
                
                sortedChapters.forEach(chapter => {
                  const volumeId = chapter.volume || 'no-volume';
                  const volumeTitle = chapter.volume_title || 'Без тома';
                  if (!groupedChapters[volumeId]) {
                    groupedChapters[volumeId] = {
                      title: volumeTitle,
                      chapters: []
                    };
                  }
                  groupedChapters[volumeId].chapters.push(chapter);
                });

                return (
                  <table className={styles.chaptertableAuthor}>
                    <thead>
                      <tr>
                        <th></th>
                        <th>{isReorderMode ? 'Позиція' : ''}</th>
                        <th>Назва</th>
                        <th></th>
                        <th></th>
                        <th>Вартість</th>
                        <th>Створено</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedChapters).map(([volumeId, volumeData], volumeIndex) => (
                        <React.Fragment key={volumeId}>
                          {/* Заголовок тома */}
                          {volumeId !== 'no-volume' && (
                            <tr className="volume-separator-row">
                              <td colSpan="8" className="volume-separator">
                                <div className="volume-title">{volumeData.title}</div>
                              </td>
                            </tr>
                          )}
                          {/* Разделитель для глав без тома - показываем перед главами без тома */}
                          {volumeId === 'no-volume' && (
                            <tr className="volume-separator-row">
                              <td colSpan="8" className="volume-separator">
                                <div className="volume-title">Глави без тома</div>
                              </td>
                            </tr>
                          )}
                          {/* Главы тома */}
                          {volumeData.chapters.map((chapter) => (
                            <tr key={chapter.id}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  id={`chapter-${chapter.id}`}
                                  className={`adult-content-checkbox ${styles.chapterCheck}`}
                                />
                              </td>
                              <td>
                                <input 
                                  className={`${styles.inputChapter} chapter-position-input`} 
                                  type="number" 
                                  value={chapterPositions[chapter.id] || chapter.position || 0}
                                  onChange={(e) => handlePositionChange(chapter.id, e.target.value)}
                                  readOnly={!isReorderMode}
                                />
                              </td>
                              <td>
                                <span className={styles.nameChapter}>{chapter.title}</span>
                              </td>
                              <td>
                                <Link to={`/chapters/${chapter.id}/edit`} className={styles.editChapter}>
                                  <img src={Edit} alt="Edit" />
                                  <span>Редагувати</span>
                                </Link>
                              </td>
                              <td>
                                <button className={styles.trashChapter}>
                                  <img src={Trash} alt="Delete" />
                                </button>
                              </td>
                              <td>
                                <span className={styles.numChapter}>
                                  {chapter.is_paid ? `${Number(chapter.price || 0).toFixed(2)} ₴` : 'Безкоштовно'}
                                </span>
                              </td>
                              <td>
                                <span className={styles.numChapter}>
                                  {new Date(chapter.created_at).toLocaleDateString()}
                                </span>
                              </td>
                              <td>
                                <Link to={`/books/${slug}/chapters/${chapter.slug}`} className={styles.chaptertableAuthorRead}>
                                  <img src={Read} alt="Read" />
                                  <span>Читати</span>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                );
              })()
            ) : (
              <div style={{textAlign: 'center', padding: '20px'}}>Немає доступних розділів</div>
            )}
          </div>

        </div>
        {/* </div> */}
        {/* COMMENTS */}
      </div>
      {chaptersData?.total_chapters > 0 && (
        <div className="total-chapters">
          Всього розділів: {chaptersData.total_chapters}
        </div>
      )}
      {chaptersData?.page_ranges && chaptersData.page_ranges.length > 0 && (
        <ChapterRangeSelector
          pageRanges={chaptersData.page_ranges}
          currentRange={chaptersData.current_range}
          onRangeSelect={handleRangeSelect}
        />
      )}
      {/* {isOwner ? (
        <BookDetailOwner {...commonProps} />
      ) : (
        <BookDetailReader {...commonProps} />
      )} */}
      <div className={`comments-section ${styles.CommentsSection}`}>
        <h2>Коментарі</h2>
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className={styles.inputComment}>
            <input 
              placeholder='Прокоментуйте...' 
              type='text' 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type='submit'><img src={RightArrow} alt="Submit" /></button>
          </form>
        ) : (
          <p>Увійдіть, щоб залишити коментар</p>
        )}
        
        {comments.length > 0 ? (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onReply={handleReplySubmit}
                onReaction={handleReaction}
                onOwnerLike={handleOwnerLike}
                isOwner={isOwner}
                currentUser={currentUser}
                getUserImage={getUserImage}
                formatDate={formatDate}
                showReplyForm={showReplyForm}
                setShowReplyForm={setShowReplyForm}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
              />
            ))}
          </div>
        ) : (
          <p>Коментарів поки ще немає.</p>
        )}
      </div>
      
      {/* Модальное окно для создания тома */}
      <ConfirmationModal
        isOpen={isCreateVolumeModalOpen}
        onRequestClose={handleCloseCreateVolumeModal}
        onConfirm={handleCreateVolume}
        type="form"
        bookTitle={book?.title || 'Книга'}
      />
    </>
  );
};

export default BookDetailOwner; 
