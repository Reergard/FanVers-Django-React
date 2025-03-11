import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getChapterDetail } from "../../api/catalog/catalogAPI";
import { Container, Button } from "react-bootstrap";
import ChapterNavigation from "../../navigation/components/ChapterNavigation";
import CommentForm from "../../reviews/components/CommentForm";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import "../../navigation/css/BookmarkButton.css";
import ModalErrorReport from "../../editors/components/ModalErrorReport";
import "../css/ChapterDetail.css";
import styles from "../css/BookDetailRouter.module.css";
import { handleCatalogApiError } from "../utils/errorUtils";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import RightArrow from "../../main/pages/img/right-arrow.png";
import { monitoringAPI } from "../../api/monitoring/monitoringAPI";
import { getChapterNavigation } from "../../api/navigation/navigationAPI";
import {
  fetchChapterComments,
  postChapterComment,
  updateReaction,
} from "../../api/reviews/reviewsAPI";
import { BreadCrumb } from "../../main/components/BreadCrumb";
import ArrowChapter from "../../main/pages/img/arrow-chapter.png";
import BgChapter from "../../main/pages/img/bg-chapter.png";
import ArrowNameChapter from "../../main/pages/img/arrow-name-chapter.png";
import CommentImg from "../../main/pages/img/comment.jpg";
import Favorite from "../../main/pages/img/Favorite.png";
import Trash from "../../main/pages/img/Trash.png";


const Comment = ({
  comment,
  onReply,
  onReaction,
  isAuthenticated,
  depth = 0,
}) => {
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
        <button
          onClick={() => onReaction(comment.id, "like")}
          disabled={!isAuthenticated}
        >
          <FaThumbsUp /> {comment.likes_count}
        </button>
        <button
          onClick={() => onReaction(comment.id, "dislike")}
          disabled={!isAuthenticated}
        >
          <FaThumbsDown /> {comment.dislikes_count}
        </button>
      </div>
      {isAuthenticated && (
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? "Скасувати" : "Відповісти"}
        </button>
      )}
      {showReplyForm && (
        <CommentForm
          onSubmit={handleReply}
          initialText={`Відповідь на: ${comment.text}`}
          readOnlyInitialText={true}
        />
      )}
      {comment.replies &&
        comment.replies.map((reply) => (
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
    title: "",
    content: "",
    book_title: "",
    id: null,
    book_id: null,
  });
  const [navigationData, setNavigationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [isRead, setIsRead] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const scrollPositions = useRef([]);
  const lastProgressUpdate = useRef(Date.now());

  const checkReadingProgress = debounce(
    async (force = false, source = "unknown") => {
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

      const contentContainer = element.querySelector(".chapter-content-inner");
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
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      const maxScroll = Math.max(1, totalHeight - viewportHeight);
      const scrollProgress = Math.min(
        100,
        Math.max(0, (currentScroll / maxScroll) * 100)
      );

      const progressData = {
        reading_time: readingTime,
        scroll_progress: scrollProgress,
        scroll_speed: 0,
      };

      try {
        const response = await monitoringAPI.updateReadingProgress(
          chapterData.id,
          progressData
        );

        if (response?.is_read) {
          setIsRead(true);
        }
      } catch (error) {}
    },
    1000
  );

  useEffect(() => {
    if (chapterData.id && !readingStartTime) {
      const startTime = Date.now();
      setReadingStartTime(startTime);
    }
  }, [chapterData.id]);

  useEffect(() => {
    if (readingStartTime) {
      checkReadingProgress(true, "initial");
    }
  }, [readingStartTime]);

  useEffect(() => {
    const handleWindowScroll = () => {
      const currentTime = Date.now();
      const currentPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      scrollPositions.current.push(currentPosition);
      if (scrollPositions.current.length > 10) {
        scrollPositions.current.shift();
      }

      lastScrollTime.current = currentTime;
      checkReadingProgress(false, "scroll");
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isRead && readingStartTime && chapterData.id) {
        checkReadingProgress(true, "visibility_change");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRead, readingStartTime, chapterData.id]);

  useEffect(() => {
    if (!isRead && readingStartTime && chapterData.id) {
      const saveProgressInterval = setInterval(() => {
        checkReadingProgress(true, "interval");
      }, 30000);

      return () => {
        clearInterval(saveProgressInterval);
      };
    }
  }, [isRead, readingStartTime, chapterData.id]);

  useEffect(() => {
    return () => {
      if (!isRead && readingStartTime && chapterData.id) {
        checkReadingProgress(true, "unmount");
      }
    };
  }, [isRead, readingStartTime, chapterData.id]);

  useEffect(() => {
    if (!bookSlug || !chapterSlug) {
      toast.error("Помилка: відсутні параметри маршруту");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [chapterResponse, navigationResponse] = await Promise.all([
          getChapterDetail(bookSlug, chapterSlug),
          getChapterNavigation(bookSlug, chapterSlug),
        ]);

        if (!chapterResponse || !chapterResponse.data) {
          throw new Error("Дані глави недоступні");
        }

        const chapterData = {
          title: chapterResponse.data.title,
          content: chapterResponse.data.content,
          book_title: chapterResponse.data.book_title,
          book_id: chapterResponse.data.book_id,
          id: chapterResponse.data.id,
          is_paid: chapterResponse.data.is_paid,
          price: chapterResponse.data.price,
        };

        if (!chapterData.title || !chapterData.content || !chapterData.id) {
          throw new Error("Неповні дані розділу");
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
      const newComment = await postChapterComment(
        chapterSlug,
        commentText,
        parentId
      );
      setComments((prevComments) => {
        if (parentId) {
          return prevComments.map((comment) =>
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
      const updatedComment = await updateReaction(commentId, "chapter", action);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      handleCatalogApiError(error, toast);
    }
  };

  const handleStartSelection = () => {
    setIsSelectionMode(true);
    document.addEventListener("mouseup", handleTextSelection);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      setShowErrorModal(true);
      setIsSelectionMode(false);
      document.removeEventListener("mouseup", handleTextSelection);
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

  // if (error) {
  //     return (
  //         <div className="error-container alert alert-danger">
  //             <h3>Помилка</h3>
  //             <p>{error}</p>
  //         </div>
  //     );
  // }

  return (
    <section className="chapter-detail">
      <Container className="chapter-container">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/catalog", label: "Назва книги" },
          ]}
        />
        {/* {navigationData && (
                    <ChapterNavigation
                        bookSlug={bookSlug}
                        currentChapter={navigationData.current_chapter}
                        prevChapter={navigationData.prev_chapter}
                        nextChapter={navigationData.next_chapter}
                        allChapters={navigationData.all_chapters}
                    />
                )} */}

        {/* <h1>{chapterData.title}</h1>
                
                <div ref={contentRef} className="chapter-content">
                    {chapterData.content ? (
                        <div 
                            className="chapter-content-inner"
                            dangerouslySetInnerHTML={{ __html: chapterData.content }} 
                        />
                    ) : (
                        <p>Зміст глави відсутній.</p>
                    )}
                </div> */}
        <div className="header-chapter-detail">
          <div className="back">
            <img src={ArrowChapter} />
            <span>Попередній розділ</span>
          </div>
          <div className="block-name-chapter">
            <img src={BgChapter} className="top-chapter" />
            <div className="chapter-name">
              <span>Назва глави</span>
              <img className="ArrowNameChapter" src={ArrowNameChapter} />
            </div>
            <img src={BgChapter} className="bot-chapter" />
          </div>
          <div className="forward">
            <span>Наступний розділ</span>
            <img src={ArrowChapter} />
          </div>
        </div>
        <div className="content-chapter">
          Чень Янь відчув, що хтось кликав його. – Ваша Високість, прошу,
          прокиньтеся... – Він відвернувся, але голоси, які він чув, не зникли.
          Насправді вони, навпаки, стали навіть гучнішими. Потім він відчув, що
          хтось обережно смикає його за рукав. – Ваша Високість, мій наслідний
          принц! Чень Янь різко розплющив очі. Добре знайома йому обстава
          зникла, робочого столу ніде не було, і звичні перегородки, засіяні
          поштовими адресами, зникли. Їх замінив дивний краєвид: кругла
          громадська площа, яка з усіх боків була оточена маленькими цегляними
          будиночками, та шибениця, яка булла встановлена в самому центрі площі.
          Сам він сидів за столом з іншого боку від шибениці. Замість зручного
          офісного крісла, що крутиться, він сидів на холодному залізному
          стільці. Поруч із ним сиділа група людей, і всі вони уважно
          спостерігали за ним. Деякі з них були одягнені як середньовічні лорди
          та леді з цих західних кінофільмів і намагалися придушити смішки, що
          виривалися назовні. Якого біса? Хіба я не поспішав закінчити креслення
          механізмів до закінчення терміну? – думаючи про це, Чень Янь був
          розгублений. Три дні поспіль він працював понаднормово. Так що
          морально фізично він був на межі. Він невиразно пригадував, що ритм
          серця став нерівним, і йому просто захотілося прилягти на стіл і
          зробити перерву. – Ваша Високість, прошу, оголосіть Ваш вирок.
        </div>

        <div className="footer-chapter">
          <div className="header-chapter-detail footer-name-chapter">
            <div className="back">
              <img src={ArrowChapter} />
              <span>Попередній розділ</span>
            </div>
            <div className="block-name-chapter">
              <img src={BgChapter} className="top-chapter" />
              <div className="chapter-name">
                <span>Назва глави</span>
                <img className="ArrowNameChapter" src={ArrowNameChapter} />
              </div>
              <img src={BgChapter} className="bot-chapter" />
            </div>
            <div className="forward">
              <span>Наступний розділ</span>
              <img src={ArrowChapter} />
            </div>
          </div>
        </div>
        <div className="container-block-error-chapter">
        <div className="error-report-container">
          {!isSelectionMode ? (
        
            <div className="block-error-chapter">
              <Button
                variant="warning"
                onClick={handleStartSelection}
                className="error-report-button"
              >
                Повідомити про помилку
              </Button>
            </div>
     
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
          <div className={styles.inputComment}>
            <input placeholder='Прокоментуйте...' type='text'/>
            <button type='submit'><img src={RightArrow}></img></button>
          </div>
          <div className="comment-block">
            <img className="user-img" src={CommentImg} />
            <div className="all-text-comment">
              <div className="info-user-comment">
                <div className="name-user-comment">Констянтин Петрович</div>
                <div className="last-seen">5 годин тому</div>
              </div>
              <div className="content-comment">
                Вітання. Добро пожалувати в систему перекладів «UA Translate».
                Цей сайт призначений для професійних мов любительських
                перекладів будь-яких новелів, фанфіків, ранобе з різних мов.
                Ваші улюблені ранобе, новели та інше на українській мові!
              </div>
              <div className="button-comment">
                <div className="left-button-comment">
                  <div className="favorite">
                    <img src={Favorite} />
                    <span>5</span>
                  </div>
                  <button>Відповісти</button>
                </div>
                <div className="right-button-comment">
                  <img src={Trash} />
                  <button>Видалити коментар</button>
                </div>
              </div>
            </div>
          </div>
          {/* {isAuthenticated ? (
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
          )} */}
        </div>
      </Container>
    </section>
  );
};

export default ChapterDetail;
