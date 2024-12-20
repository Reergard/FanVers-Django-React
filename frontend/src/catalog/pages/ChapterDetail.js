import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getChapterDetail } from '../../api/catalog/catalogAPI';
import { Container, Button } from 'react-bootstrap';
import ChapterNavigation from '../../navigation/components/ChapterNavigation';
import CommentForm from '../../reviews/components/CommentForm';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import '../../navigation/css/BookmarkButton.css';
import ModalErrorReport from '../../editors/components/ModalErrorReport';
import '../css/ChapterDetail.css';
import { handleCatalogApiError } from '../utils/errorUtils';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { monitoringAPI } from '../../api/monitoring/monitoringAPI';
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
                    {showReplyForm ? 'Скасувати' : 'Відповісти'}
                </button>
            )}
            {showReplyForm && (
                <CommentForm onSubmit={handleReply} initialText={`Відповідь на: ${comment.text}`} readOnlyInitialText={true} />
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
    const [chapterData, setChapterData] = useState({ 
        title: '', 
        content: '',
        book_title: '',
        id: null,
        book_id: null
    });
    const [navigationData, setNavigationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [readingStartTime, setReadingStartTime] = useState(null);
    const [isRead, setIsRead] = useState(false);
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const lastScrollTime = useRef(Date.now());
    const scrollPositions = useRef([]);
    const lastProgressUpdate = useRef(Date.now());

    const checkReadingProgress = debounce(async (force = false, source = 'unknown') => {
        if (isRead) {
            return;
        }
        
        if (!readingStartTime) {
            return;
        }

        const element = contentRef.current;
        if (!element) {
            return;
        }

        const contentContainer = element.querySelector('.chapter-content-inner');
        if (!contentContainer) {
            return;
        }

        const currentTime = Date.now();
        const readingTime = Math.floor((currentTime - readingStartTime) / 1000);
        
        const totalHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
        );
        const viewportHeight = window.innerHeight;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        const maxScroll = Math.max(1, totalHeight - viewportHeight);
        const scrollProgress = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));

        const progressData = {
            reading_time: readingTime,
            scroll_progress: scrollProgress,
            scroll_speed: 0
        };

        try {
            const response = await monitoringAPI.updateReadingProgress(
                chapterData.id, 
                progressData
            );
            
            if (response?.is_read) {
                setIsRead(true);
            }
        } catch (error) {
        }
    }, 1000);

    // Ініціалізація часу початку читання під час завантаження глави
    useEffect(() => {
        if (chapterData.id && !readingStartTime) {
            const startTime = Date.now();
            setReadingStartTime(startTime);
        }
    }, [chapterData.id]);

    // Відстеження змін readingStartTime
    useEffect(() => {
        if (readingStartTime) {
            checkReadingProgress(true, 'initial');
        }
    }, [readingStartTime]);

    // Обробник скролу
    useEffect(() => {
        const handleWindowScroll = () => {
            const currentTime = Date.now();
            const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            scrollPositions.current.push(currentPosition);
            if (scrollPositions.current.length > 10) {
                scrollPositions.current.shift();
            }
            
            lastScrollTime.current = currentTime;
            checkReadingProgress(false, 'scroll');
        };

        window.addEventListener('scroll', handleWindowScroll);
        return () => {
            window.removeEventListener('scroll', handleWindowScroll);
        };
    }, []);

    // Відстеження видимості сторінки
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isRead && readingStartTime && chapterData.id) {
                checkReadingProgress(true, 'visibility_change');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isRead, readingStartTime, chapterData.id]);

    // Періодичне оновлення прогресу
    useEffect(() => {
        if (!isRead && readingStartTime && chapterData.id) {
            const saveProgressInterval = setInterval(() => {
                checkReadingProgress(true, 'interval');
            }, 30000);

            return () => {
                clearInterval(saveProgressInterval);
            };
        }
    }, [isRead, readingStartTime, chapterData.id]);

    // Збереження прогресу під час розмонтування компонента
    useEffect(() => {
        return () => {
            if (!isRead && readingStartTime && chapterData.id) {
                checkReadingProgress(true, 'unmount');
            }
        };
    }, [isRead, readingStartTime, chapterData.id]);

    useEffect(() => {
        if (!bookSlug || !chapterSlug) {
            toast.error('Помилка: відсутні параметри маршруту');
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [chapterResponse, navigationResponse] = await Promise.all([
                    getChapterDetail(bookSlug, chapterSlug),
                    getChapterNavigation(bookSlug, chapterSlug)
                ]);
                
                if (!chapterResponse || !chapterResponse.data) {
                    throw new Error('Дані глави недоступні');
                }

                const chapterData = {
                    title: chapterResponse.data.title,
                    content: chapterResponse.data.content,
                    book_title: chapterResponse.data.book_title,
                    book_id: chapterResponse.data.book_id,
                    id: chapterResponse.data.id,
                    is_paid: chapterResponse.data.is_paid,
                    price: chapterResponse.data.price
                };

                if (!chapterData.title || !chapterData.content || !chapterData.id) {
                    throw new Error('Неповні дані розділу');
                }

                setChapterData(chapterData);
                setNavigationData(navigationResponse.data);
                
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message;
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookSlug, chapterSlug, navigate]);

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
            handleCatalogApiError(error, toast);
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
            handleCatalogApiError(error, toast);
        }
    };

    const handleStartSelection = () => {
        setIsSelectionMode(true);
        document.addEventListener('mouseup', handleTextSelection);
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
            setShowErrorModal(true);
            setIsSelectionMode(false);
            document.removeEventListener('mouseup', handleTextSelection);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Завантаження...</span>
                </div>
                <p>Завантаження розділу...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container alert alert-danger">
                <h3>Помилка</h3>
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
                
                <div ref={contentRef} className="chapter-content">
                    {chapterData.content ? (
                        <div 
                            className="chapter-content-inner"
                            dangerouslySetInnerHTML={{ __html: chapterData.content }} 
                        />
                    ) : (
                        <p>Зміст глави відсутній.</p>
                    )}
                </div>

                <div className="error-report-container">
                    {!isSelectionMode ? (
                        <Button 
                            variant="warning" 
                            onClick={handleStartSelection}
                            className="error-report-button"
                        >
                            Повідомити про помилку
                        </Button>
                    ) : (
                        <div className="selection-mode">
                            {isSelectionMode && (
                                <div className="instructions-text">
                                    Виділіть будь ласка текст в якому ви знайшли помилку!
                                </div>
                            )}
                            <Button 
                                variant="primary"
                                onClick={() => setShowErrorModal(true)}
                                disabled={!selectedText}
                                className="confirm-selection-button"
                            >
                                Підтвердити вибраний текст
                            </Button>
                        </div>
                    )}
                </div>

                <ModalErrorReport 
                    show={showErrorModal}
                    onHide={() => setShowErrorModal(false)}
                    bookId={chapterData.book_id}
                    chapterId={chapterData.id}
                    bookTitle={chapterData.book_title}
                    chapterTitle={chapterData.title}
                    selectedText={selectedText}
                />

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
                    <h2>Коментарі</h2>
                    {isAuthenticated ? (
                        <CommentForm onSubmit={handleCommentSubmit} />
                    ) : (
                        <p>Увійдіть, щоб залишити коментар</p>
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
                        <p>Коментарів поки ще немає.</p>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default ChapterDetail;