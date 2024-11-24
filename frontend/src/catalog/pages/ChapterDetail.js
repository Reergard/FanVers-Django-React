import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getChapterDetail } from '../../api/catalog/catalogAPI';
import { Container } from 'react-bootstrap';
import ChapterNavigation from '../../navigation/components/ChapterNavigation';
import CommentForm from '../../reviews/components/CommentForm';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import '../../navigation/css/BookmarkButton.css';

// Импорты для пагинации и отзывов нужно будет добавить или создать
import { getChapterNavigation } from '../../api/navigation/navigationAPI';
import { fetchChapterComments, postChapterComment, updateReaction } from '../../api/reviews/reviewsAPI';

const Comment = ({ comment, onReply, onReaction, isAuthenticated, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleReply = (text) => {
        onReply(text, comment.id);
        setShowReplyForm(false);
    };

    return (
        <div className="comment" style={{ marginLeft: `${depth * 20}px` }}>
            <p>{comment.text}</p>
            <p>Автор: {comment.user}</p>
            <p>Дата: {new Date(comment.created_at).toLocaleString()}</p>
            <div className="reactions">
                <button onClick={() => onReaction(comment.id, 'like')} disabled={!isAuthenticated}>
                    <FaThumbsUp /> {comment.likes_count}
                </button>
                <button onClick={() => onReaction(comment.id, 'dislike')} disabled={!isAuthenticated}>
                    <FaThumbsDown /> {comment.dislikes_count}
                </button>
            </div>
            {isAuthenticated && (
                <button onClick={() => setShowReplyForm(!showReplyForm)}>
                    {showReplyForm ? 'Отменить' : 'Ответить'}
                </button>
            )}
            {showReplyForm && (
                <CommentForm onSubmit={handleReply} initialText={`Ответ на: ${comment.text}`} readOnlyInitialText={true} />
            )}
            {comment.replies && comment.replies.map(reply => (
                <Comment 
                    key={reply.id} 
                    comment={reply} 
                    onReply={onReply}
                    onReaction={onReaction}
                    isAuthenticated={isAuthenticated}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
};

const ChapterDetail = () => {
    const { bookSlug, chapterSlug } = useParams();
    const [chapterData, setChapterData] = useState({ title: '', content: '' });
    const [navigationData, setNavigationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Начало загрузки данных главы');
                console.log(`Параметры: bookSlug=${bookSlug}, chapterSlug=${chapterSlug}`);

                // Загружаем все данные параллельно
                const [chapterResponse, navigationResponse, commentsResponse] = await Promise.all([
                    getChapterDetail(bookSlug, chapterSlug),
                    getChapterNavigation(bookSlug, chapterSlug),
                    fetchChapterComments(chapterSlug)
                ]);

                console.log('Данные главы:', chapterResponse.data);
                console.log('Данные навигации:', navigationResponse.data);

                setChapterData(chapterResponse.data);
                setNavigationData(navigationResponse.data);
                setComments(commentsResponse || []);
                
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError(error.message || 'Произошла ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookSlug, chapterSlug]);

    const handleCommentSubmit = async (commentText, parentId = null) => {
        try {
            const newComment = await postChapterComment(chapterSlug, commentText, parentId);
            setComments(prevComments => {
                if (parentId) {
                    return prevComments.map(comment => 
                        comment.id === parentId 
                            ? { ...comment, replies: [...comment.replies, newComment] }
                            : comment
                    );
                }
                return [...prevComments, newComment];
            });
        } catch (error) {
            console.error('Ошибка при отправке комментария:', error);
            setError("Не удалось отправить комментарий");
        }
    };

    const handleReaction = async (commentId, action) => {
        try {
            const updatedComment = await updateReaction(commentId, 'chapter', action);
            setComments(prevComments => 
                prevComments.map(comment => 
                    comment.id === commentId ? updatedComment : comment
                )
            );
        } catch (error) {
            console.error('Ошибка при обновлении реакции:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p>Загрузка главы...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container alert alert-danger">
                <h3>Ошибка</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <section className="chapter-detail">
            <Container>
                {navigationData && (
                    <ChapterNavigation
                        bookSlug={bookSlug}
                        currentChapter={navigationData.current_chapter}
                        prevChapter={navigationData.prev_chapter}
                        nextChapter={navigationData.next_chapter}
                        allChapters={navigationData.all_chapters}
                    />
                )}

                <h1>{chapterData.title}</h1>
                
                <div className="chapter-content">
                    {chapterData.content ? (
                        <div dangerouslySetInnerHTML={{ __html: chapterData.content }} />
                    ) : (
                        <p>Содержимое главы отсутствует.</p>
                    )}
                </div>

                {navigationData && (
                    <div className="chapter-navigation-buttons">
                        {navigationData.prev_chapter && (
                            <Link 
                                to={`/books/${bookSlug}/chapters/${navigationData.prev_chapter.slug}`}
                                className="nav-button prev-button"
                            >
                                ← {navigationData.prev_chapter.title}
                            </Link>
                        )}
                        
                        {navigationData.next_chapter && (
                            <Link 
                                to={`/books/${bookSlug}/chapters/${navigationData.next_chapter.slug}`}
                                className="nav-button next-button"
                            >
                                {navigationData.next_chapter.title} →
                            </Link>
                        )}
                    </div>
                )}

                <div className="comments-section">
                    <h2>Комментарии</h2>
                    {isAuthenticated ? (
                        <CommentForm onSubmit={handleCommentSubmit} />
                    ) : (
                        <p>Войдите, чтобы оставить комментарий</p>
                    )}
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <Comment 
                                key={comment.id} 
                                comment={comment} 
                                onReply={handleCommentSubmit}
                                onReaction={handleReaction}
                                isAuthenticated={isAuthenticated}
                            />
                        ))
                    ) : (
                        <p>Комментариев пока нет.</p>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default ChapterDetail;
