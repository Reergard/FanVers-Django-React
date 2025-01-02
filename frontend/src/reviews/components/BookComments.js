import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchBookComments, postBookComment, updateReaction, updateOwnerLike } from '../../api/reviews/reviewsAPI';
import CommentForm from './CommentForm';
import useBookAnalytics from '../../hooks/useBookAnalytics';
import '../style/BookComments.css';

const BookComments = ({ bookSlug, book, isBookOwner }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { trackComment, trackCommentLike } = useBookAnalytics();

  const loadComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await fetchBookComments(bookSlug);
      setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
    } catch (error) {
      console.error('Ошибка при загрузке комментариев:', error);
      setError('Ошибка при загрузке комментариев');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [bookSlug]);

  const handleCommentSubmit = async (text, parentId = null) => {
    if (!isAuthenticated) {
        alert('Пожалуйста, войдите в систему, чтобы оставить комментарий');
        return;
    }
    console.log('Попытка добавления комментария для книги:', bookSlug);
    setLoading(true);
    try {
        const newComment = await postBookComment(bookSlug, text, parentId);
        console.log('Комментарий успешно добавлен:', newComment);
        setComments(prevComments => 
          Array.isArray(prevComments) ? [...prevComments, newComment] : [newComment]
        );
        console.log('Отправка данных в аналитику для комментария');
        await trackComment(bookSlug);
        console.log('Аналитика комментария обновлена');
        await loadComments();
    } catch (error) {
        console.error('Ошибка при отправке комментария:', error);
        setError('Ошибка при отправке комментария');
    } finally {
        setLoading(false);
    }
  };

  const handleReply = async (event, parentId, parentText) => {
    event.preventDefault();
    if (!replyingTo) return;

    setLoading(true);
    try {
      const replyText = `${parentText}, ${replyingTo.text}`;
      await postBookComment(bookSlug, replyText, parentId);
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      setError('Ошибка при добавлении ответа');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (commentId, action) => {
    if (!isAuthenticated) {
        alert('Пожалуйста, войдите в систему, чтобы оставить реакцию');
        return;
    }
    console.log('Попытка добавления реакции:', { commentId, action, bookSlug });
    try {
      await updateReaction(commentId, 'book', action);
      if (action === 'like') {
        console.log('Отправка данных в аналитику для лайка');
        await trackCommentLike(bookSlug);
        console.log('Аналитика лайка обновлена');
      }
      loadComments();
    } catch (error) {
      console.error('Ошибка при обновлении реакции:', error);
      setError('Ошибка при обновлении реакции');
    }
  };

  const handleOwnerLike = async (commentId) => {
    if (!isAuthenticated) {
        alert('Будь ласка, увійдіть в систему');
        return;
    }
    
    try {
        await updateOwnerLike(commentId, 'book-comment');
        await loadComments();
    } catch (error) {
        console.error('Помилка при оновленні реакції:', error);
        setError('Помилка при оновленні реакції власника');
    }
  };

  const renderComment = (comment) => (
    <li key={comment.id}>
      <p>{comment.text}</p>
      <div className="comment-actions">
        <button 
          onClick={() => handleReaction(comment.id, 'like')}
          style={{color: comment.user_reaction === 'like' ? 'blue' : 'black'}}
        >
          👍 {comment.likes_count}
        </button>
        <button 
          onClick={() => handleReaction(comment.id, 'dislike')}
          style={{color: comment.user_reaction === 'dislike' ? 'red' : 'black'}}
        >
          👎 {comment.dislikes_count}
        </button>
        
        {/* Заменяем отдельную кнопку на кликабельную звездочку для владельца */}
        {isBookOwner ? (
          <button 
            onClick={() => handleOwnerLike(comment.id)}
            className={`owner-like ${comment.has_owner_like ? 'active' : ''}`}
          >
            ⭐ {comment.has_owner_like ? `Лайк від ${comment.owner_like_type}` : 'Лайк власника'}
          </button>
        ) : (
          comment.has_owner_like && (
            <span className="owner-like">
              ⭐ Лайк від {comment.owner_like_type}
            </span>
          )
        )}
        
        <button onClick={() => setReplyingTo({ id: comment.id, text: '' })}>
          Коментувати
        </button>
      </div>
      {replyingTo && replyingTo.id === comment.id && (
        <form onSubmit={(e) => handleReply(e, comment.id, comment.text)}>
          <textarea
            value={replyingTo.text}
            onChange={(e) => setReplyingTo({ ...replyingTo, text: e.target.value })}
            placeholder="Напишите свой ответ"
          ></textarea>
          <button type="submit" disabled={loading}>Ответить</button>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <ul>
          {comment.replies.map(renderComment)}
        </ul>
      )}
    </li>
  );

  return (
    <div>
      <h2>Комментарии</h2>
      {error && <p className="error-message">{error}</p>}
      {loading && <p>Загрузка...</p>}
      
      {isAuthenticated && (
        <CommentForm
          onSubmit={handleCommentSubmit}
          loading={loading}
          bookId={bookSlug}
        />
      )}

      {Array.isArray(comments) && comments.length > 0 ? (
        <ul className="comments-list">
          {comments.map(renderComment)}
        </ul>
      ) : (
        <p>{loading ? 'Загрузка комментариев...' : 'Комментариев пока нет.'}</p>
      )}

      {!isAuthenticated && (
        <p className="auth-message">Войдите, чтобы оставить комментарий</p>
      )}
    </div>
  );
};

export default BookComments;
