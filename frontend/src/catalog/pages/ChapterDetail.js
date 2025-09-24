import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getChapterDetail } from '../../api/catalog/catalogAPI';
import { Container, Button } from "react-bootstrap";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import "../../navigation/css/BookmarkButton.css";
import ModalErrorReport from '../../editors/components/ModalErrorReport';
import "../css/ChapterDetail.css";
import styles from "../css/BookDetailRouter.module.css";
import { handleCatalogApiError } from "../utils/errorUtils";
import { useToast } from "../../components/CustomToast";
import { debounce } from "lodash";
import RightArrow from '../../main/pages/img/right-arrow.png';
import { monitoringAPI } from '../../api/monitoring/monitoringAPI';
import { getChapterNavigation } from '../../api/navigation/navigationAPI';
import CommentSection from '../../reviews/components/CommentSection';
import { BreadCrumb } from '../../main/components/BreadCrumb';
import ArrowChapter from '../../main/pages/img/arrow-chapter.png';
import BgChapter from '../../main/pages/img/bg-chapter.png';
import ArrowNameChapter from '../../main/pages/img/arrow-name-chapter.png';



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
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [isRead, setIsRead] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const currentUser = useSelector(state => state.auth.user);
  const lastScrollTime = useRef(Date.now());
  const scrollPositions = useRef([]);
  const lastProgressUpdate = useRef(Date.now());
  const { error: showError } = useToast();

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
      showError("Помилка: відсутні параметри маршруту");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [chapterResult, navigationResult] = await Promise.all([
          getChapterDetail(bookSlug, chapterSlug),
          getChapterNavigation(bookSlug, chapterSlug),
        ]);

        // Данные уже в правильном формате
        setChapterData(chapterResult);
        setNavigationData(navigationResult.data); // Извлекаем data из ответа
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookSlug, chapterSlug, navigate, showError]);


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

  const handleChapterSelect = (chapterSlug) => {
    navigate(`/books/${bookSlug}/chapters/${chapterSlug}`);
    setShowChapterList(false);
  };

  const toggleChapterList = () => {
    setShowChapterList(!showChapterList);
  };

  // Закрываем выпадающий список при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChapterList && !event.target.closest('.chapter-name') && !event.target.closest('.chapter-list-dropdown')) {
        setShowChapterList(false);
      }
    };

    if (showChapterList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChapterList]);

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


  return (
    <section className="chapter-detail">
      <Container className="chapter-container">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: `/books/${bookSlug}`, label: chapterData.book_title || "Назва книги" },
          ]}
        />
        

        {/* Выпадающий список глав */}
        {showChapterList && navigationData?.all_chapters && (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="chapter-list-dropdown" style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              minWidth: '300px',
              marginTop: '10px'
            }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>Список глав:</strong>
            </div>
            {navigationData.all_chapters.map((chapter, index) => (
              <div
                key={chapter.slug}
                onClick={() => handleChapterSelect(chapter.slug)}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  backgroundColor: chapter.slug === chapterSlug ? '#f0f0f0' : 'white',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = chapter.slug === chapterSlug ? '#f0f0f0' : 'white'}
              >
                <div style={{ fontWeight: chapter.slug === chapterSlug ? 'bold' : 'normal' }}>
                  {index + 1}. {chapter.title}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
        <div className="header-chapter-detail">
          <div className="back">
            {navigationData?.prev_chapter ? (
              <Link to={`/books/${bookSlug}/chapters/${navigationData.prev_chapter.slug}`}>
                <img src={ArrowChapter} alt="Previous chapter" />
                <span>Попередній розділ</span>
              </Link>
            ) : (
              <div>
                <img src={ArrowChapter} alt="No previous chapter" />
                <span>Попередній розділ</span>
              </div>
            )}
          </div>
          <div className="block-name-chapter">
            <img src={BgChapter} className="top-chapter" />
            <div className="chapter-name" onClick={toggleChapterList} style={{ cursor: 'pointer' }}>
              <span>{chapterData.title || "Назва глави"}</span>
              <img className="ArrowNameChapter" src={ArrowNameChapter} />
            </div>
            <img src={BgChapter} className="bot-chapter" />
          </div>
          <div className="forward">
            {navigationData?.next_chapter ? (
              <Link to={`/books/${bookSlug}/chapters/${navigationData.next_chapter.slug}`}>
                <span>Наступний розділ</span>
                <img src={ArrowChapter} alt="Next chapter" />
              </Link>
            ) : (
              <div>
                <span>Наступний розділ</span>
                <img src={ArrowChapter} alt="No next chapter" />
              </div>
            )}
          </div>
        </div>
        <div ref={contentRef} className="content-chapter">
          {chapterData.content ? (
            <div 
              className="chapter-content-inner"
              dangerouslySetInnerHTML={{ __html: chapterData.content }} 
            />
          ) : (
            <p>Зміст глави відсутній.</p>
          )}
        </div>

        <div className="footer-chapter">
          <div className="header-chapter-detail footer-name-chapter">
            <div className="back">
              {navigationData?.prev_chapter ? (
                <Link to={`/books/${bookSlug}/chapters/${navigationData.prev_chapter.slug}`}>
                  <img src={ArrowChapter} alt="Previous chapter" />
                  <span>Попередній розділ</span>
                </Link>
              ) : (
                <div>
                  <img src={ArrowChapter} alt="No previous chapter" />
                  <span>Попередній розділ</span>
                </div>
              )}
            </div>
            <div className="block-name-chapter">
              <img src={BgChapter} className="top-chapter" />
              <div className="chapter-name" onClick={toggleChapterList} style={{ cursor: 'pointer' }}>
                <span>{chapterData.title || "Назва глави"}</span>
                <img className="ArrowNameChapter" src={ArrowNameChapter} />
              </div>
              <img src={BgChapter} className="bot-chapter" />
            </div>
            <div className="forward">
              {navigationData?.next_chapter ? (
                <Link to={`/books/${bookSlug}/chapters/${navigationData.next_chapter.slug}`}>
                  <span>Наступний розділ</span>
                  <img src={ArrowChapter} alt="Next chapter" />
                </Link>
              ) : (
                <div>
                  <span>Наступний розділ</span>
                  <img src={ArrowChapter} alt="No next chapter" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Выпадающий список глав для нижней навигации */}
        {showChapterList && navigationData?.all_chapters && (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="chapter-list-dropdown" style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              minWidth: '300px',
              marginTop: '10px'
            }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>Список глав:</strong>
            </div>
            {navigationData.all_chapters.map((chapter, index) => (
              <div
                key={chapter.slug}
                onClick={() => handleChapterSelect(chapter.slug)}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  backgroundColor: chapter.slug === chapterSlug ? '#f0f0f0' : 'white',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = chapter.slug === chapterSlug ? '#f0f0f0' : 'white'}
              >
                <div style={{ fontWeight: chapter.slug === chapterSlug ? 'bold' : 'normal' }}>
                  {index + 1}. {chapter.title}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

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


        {/* Секция комментариев к главе */}
        {(() => {
          const isOwner = currentUser && 
                          chapterData.book_id && 
                          currentUser.id === chapterData.book_owner_id;
          return (
            <CommentSection 
              type="chapter"
              slug={chapterSlug} 
              isOwner={isOwner}
            />
          );
        })()}
      </Container>
    </section>
  );
};

export default ChapterDetail;
