import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { reviewsAPI } from '../../api/reviews/reviewsAPI';
import { useToast } from '../../components/CustomToast';
import styles from '../../catalog/css/BookDetailRouter.module.css';
import RightArrow from '../../main/pages/img/right-arrow.png';
import LeftFooter from '../../catalog/pages/img/left-footer.svg';
import RightFooter from '../../catalog/pages/img/right-footer.svg';
import Trash from '../../catalog/pages/img/Trash.svg';
import ghostFull from '../../assets/images/icons/ghost_full.png';

// Валидация комментария
const validateComment = (text) => {
  if (!text.trim()) return 'Комментарий не может быть пустым';
  if (text.length < 3) return 'Комментарий слишком короткий (минимум 3 символа)';
  if (text.length > 1000) return 'Комментарий слишком длинный (максимум 1000 символов)';
  return null;
};

// Защита от спама
const useSpamProtection = () => {
  const [lastCommentTime, setLastCommentTime] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const canComment = () => {
    const now = Date.now();
    const timeSinceLastComment = now - lastCommentTime;
    const minInterval = 5000; // 5 секунд между комментариями
    
    if (timeSinceLastComment < minInterval) {
      setIsBlocked(true);
      setTimeout(() => setIsBlocked(false), minInterval - timeSinceLastComment);
      return false;
    }
    return true;
  };
  
  const recordComment = () => {
    setLastCommentTime(Date.now());
  };
  
  return { canComment, recordComment, isBlocked };
};

// Компонент отдельного комментария
const CommentComponent = ({ 
  comment, 
  onReply, 
  onReaction, 
  onOwnerLike, 
  isOwner, 
  currentUser, 
  getUserImage, 
  formatDate, 
  showReplyForm, 
  setShowReplyForm, 
  replyText, 
  setReplyText, 
  handleReplySubmit 
}) => {
  const [localShowReplyForm, setLocalShowReplyForm] = useState(false);

  const handleReplyClick = () => {
    setLocalShowReplyForm(!localShowReplyForm);
    setShowReplyForm(comment.id);
  };

  const handleLocalReplySubmit = (e) => {
    handleReplySubmit(e, comment);
  };

  const isReply = comment.parent !== null;

  return (
    <>
      <div className={isReply ? styles.commentBlockReply : styles.commentBlock}>
        <img className={styles.userImg} src={getUserImage(comment.user)} alt="User" />
        <div className={styles.allTextComment}>
          <div className={styles.infoUserComment}>
            <div className={styles.nameUserComment}>
              {comment.user?.username || 'Невідомий користувач'}
            </div>
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
              {/* Показываем лайк автора всем, но кнопка только для владельца */}
              {(() => {
                console.log(`CommentComponent: лайк автора для комментария ${comment.id}:`, {
                  hasOwnerLike: comment.has_owner_like,
                  ownerLikeType: comment.owner_like_type,
                  isOwner,
                  currentUserId: currentUser?.id,
                  commentUserId: comment.user?.id
                });
                
                if (comment.has_owner_like) {
                  return (
                    <span className={styles.ownerLikeDisplay}>
                      ✅ {comment.owner_like_type || 'Автора'}
                    </span>
                  );
                } else if (isOwner) {
                  return (
                    <button onClick={() => onOwnerLike(comment.id)}>
                      ⭐ {comment.owner_like_type || 'Автора'}
                    </button>
                  );
                }
                return null;
              })()}
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
            maxLength={1000}
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

// Основной компонент секции комментариев (универсальный)
const CommentSection = ({ 
  type = 'book', // 'book' или 'chapter'
  slug, // bookSlug или chapterSlug
  isOwner 
}) => {
  const currentUser = useSelector(state => state.auth.user);
  const { error: showError, success } = useToast();
  const { canComment, recordComment, isBlocked } = useSpamProtection();
  
  // Отладочная информация
  console.log(`CommentSection (${type}):`, {
    slug,
    isOwner,
    currentUser: currentUser?.id,
    currentUsername: currentUser?.username
  });
  
  // Состояние для комментариев
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Определяем API функции в зависимости от типа
  const getApiFunctions = () => {
    if (type === 'book') {
      return {
        fetchComments: () => reviewsAPI.fetchBookComments(slug),
        postComment: (text, parentId) => reviewsAPI.postBookComment(slug, text, parentId),
        updateReaction: (commentId, action) => reviewsAPI.updateReaction(commentId, 'book', action),
        updateOwnerLike: (commentId) => reviewsAPI.updateOwnerLike(commentId, 'book'),
        queryKey: ['book-comments', slug]
      };
    } else {
      return {
        fetchComments: () => reviewsAPI.fetchChapterComments(slug),
        postComment: (text, parentId) => reviewsAPI.postChapterComment(slug, text, parentId),
        updateReaction: (commentId, action) => reviewsAPI.updateReaction(commentId, 'chapter', action),
        updateOwnerLike: (commentId) => reviewsAPI.updateOwnerLike(commentId, 'chapter'),
        queryKey: ['chapter-comments', slug]
      };
    }
  };

  const apiFunctions = getApiFunctions();

  // Загружаем комментарии
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: apiFunctions.queryKey,
    queryFn: async () => {
      try {
        const commentsData = await apiFunctions.fetchComments();
        return commentsData;
      } catch (error) {
        console.error(`Error loading ${type} comments:`, error);
        return [];
      }
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Валидация при изменении текста
  useEffect(() => {
    if (commentText) {
      const error = validateComment(commentText);
      setValidationError(error || '');
    } else {
      setValidationError('');
    }
  }, [commentText]);

  // Функции для работы с комментариями
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentUser) return;
    
    // Проверяем валидацию
    const validation = validateComment(commentText);
    if (validation) {
      showError(validation);
      return;
    }
    
    // Проверяем защиту от спама
    if (!canComment()) {
      showError('Слишком быстро! Подождите 5 секунд перед следующим комментарием');
      return;
    }
    
    if (isSubmitting) return; // Защита от повторной отправки
    
    setIsSubmitting(true);
    try {
      await apiFunctions.postComment(commentText);
      setCommentText('');
      setValidationError('');
      recordComment(); // Записываем время отправки
      success('Комментарий добавлен');
      refetchComments();
    } catch (error) {
      console.error(`Error posting ${type} comment:`, error);
      
      if (error.response?.status === 403) {
        const entityName = type === 'book' ? 'книги' : 'розділу';
        showError(error.response?.data?.detail || `У вас немає прав для коментування цієї ${entityName}`);
      } else {
        showError('Помилка при відправці коментаря: ' + (error.message || 'Невідома помилка'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e, parentComment) => {
    e.preventDefault();
    
    if (!replyText.trim() || !currentUser) return;
    
    // Проверяем валидацию
    const validation = validateComment(replyText);
    if (validation) {
      showError(validation);
      return;
    }
    
    // Проверяем защиту от спама
    if (!canComment()) {
      showError('Слишком быстро! Подождите 5 секунд перед следующим комментарием');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiFunctions.postComment(replyText, parentComment.id);
      setReplyText('');
      setReplyingTo(null);
      setShowReplyForm(null);
      recordComment(); // Записываем время отправки
      success('Ответ добавлен');
      refetchComments();
    } catch (error) {
      console.error(`Error posting ${type} reply:`, error);
      
      if (error.response?.status === 403) {
        const entityName = type === 'book' ? 'книги' : 'розділу';
        showError(error.response?.data?.detail || `У вас немає прав для коментування цієї ${entityName}`);
      } else {
        showError('Помилка при відправці відповіді: ' + (error.message || 'Невідома помилка'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId, action) => {
    if (!currentUser) return;

    try {
      await apiFunctions.updateReaction(commentId, action);
      refetchComments();
    } catch (error) {
      console.error(`Error updating ${type} reaction:`, error);
    }
  };

  const handleOwnerLike = async (commentId) => {
    if (!currentUser || !isOwner) return;

    try {
      await apiFunctions.updateOwnerLike(commentId);
      refetchComments();
    } catch (error) {
      console.error(`Error updating ${type} owner like:`, error);
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

  // Определяем тексты в зависимости от типа
  const getTexts = () => {
    if (type === 'book') {
      return {
        title: 'Коментарі',
        placeholder: 'Прокоментуйте...',
        emptyMessage: 'Коментарів поки ще немає.'
      };
    } else {
      return {
        title: 'Коментарі до розділу',
        placeholder: 'Прокоментуйте розділ...',
        emptyMessage: 'Коментарів до розділу поки ще немає.'
      };
    }
  };

  const texts = getTexts();

  return (
    <div className={`comments-section ${styles.CommentsSection}`}>
      <h2>{texts.title}</h2>
      
      {currentUser ? (
        <form onSubmit={handleCommentSubmit} className={styles.inputComment}>
          <input 
            placeholder={texts.placeholder} 
            type='text' 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={1000}
            disabled={isSubmitting || isBlocked}
          />
          <button 
            type='submit' 
            disabled={isSubmitting || isBlocked || !commentText.trim() || !!validationError}
          >
            <img src={RightArrow} alt="Submit" />
          </button>
        </form>
      ) : (
        <p>Увійдіть, щоб залишити коментар</p>
      )}
      
      {/* Показываем ошибки валидации */}
      {validationError && (
        <div className="validation-error" style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {validationError}
        </div>
      )}
      
      {/* Показываем статус отправки */}
      {isSubmitting && (
        <div style={{ color: 'blue', fontSize: '12px', marginTop: '5px' }}>
          Отправка комментария...
        </div>
      )}
      
      {/* Показываем блокировку от спама */}
      {isBlocked && (
        <div style={{ color: 'orange', fontSize: '12px', marginTop: '5px' }}>
          Слишком быстро! Подождите перед следующим комментарием
        </div>
      )}
      
      <style>{`
        .ownerLikeDisplay {
          color: #28a745;
          font-weight: bold;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
      
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
        <p>{texts.emptyMessage}</p>
      )}
    </div>
  );
};

export default CommentSection;
