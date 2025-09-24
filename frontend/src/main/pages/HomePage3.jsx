import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { mainAPI } from '../../api/main/mainAPI';
import "../styles/HomePage3.css";
import Slider from "react-slick";
import AdultIcon from "../../catalog/pages/img/18.svg";
import ExpandableList from "../../components/ExpandableList";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useBookAccess } from "../../hooks/useBookAccess";


const NovelCard = ({ 
  title, 
  description, 
  image, 
  book_type, 
  adult_content, 
  chapters_count, 
  latest_chapter_title,
  last_chapter_update,
  genres = [],
  tags = [],
  fandoms = [],
  slug
}) => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const { checkAccessAndNavigate } = useBookAccess();

  // Логирование данных для отладки
  console.log('NovelCard данные:', {
    title,
    genres,
    tags,
    fandoms,
    slug
  });
  const handleReadClick = async (e) => {
    e.stopPropagation();
    console.log('NovelCard: клик по кнопке "читати"', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги:', { title, slug });
      return;
    }

    await checkAccessAndNavigate(slug, title);
  };

  const handleCardClick = async () => {
    console.log('NovelCard: клик по карточке', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги при клике по карточке:', { title, slug });
      return;
    }

    await checkAccessAndNavigate(slug, title);
  };

  const handleImageClick = async (e) => {
    e.stopPropagation();
    console.log('NovelCard: клик по изображению', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги при клике по изображению:', { title, slug });
      return;
    }

    await checkAccessAndNavigate(slug, title);
  };

  return (
    <div 
      className="novel-card homepage"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`Книга: ${title}. Натисніть для переходу на сторінку книги`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="novel-cover">
        <div className="image-container">
          <div 
            className="image-wrapper"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label={`Зображення книги "${title}". Натисніть для переходу на сторінку книги`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick(e);
              }
            }}
          >
            <img
              src={image}
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
      <div className="title-block-homepage">
        <span className="novel-title-homepage3">{title}</span>
        <div className="line-homepage-title3"></div>
      </div>
      <div className="chapter-characteristic">
        <div className="chapter">
          <div className="number-chapter">
            <span>Розділ {chapters_count || 0}</span>
            <p>:</p>
          </div>
          <div className="name-chapter">
            {latest_chapter_title || 'Немає глав'}
          </div>
        </div>
        <div className="all-tags">
          <ExpandableList
            title="Фендом"
            className="fandom"
            items={fandoms}
            maxVisible={2}
          />
          <ExpandableList
            title="Теги"
            className="tags"
            items={tags}
            maxVisible={2}
          />
          <ExpandableList
            title="Жанри"
            className="genres"
            items={genres}
            maxVisible={2}
          />
        </div>
      </div>

      <div className="novel-button">
        <button 
          className="read-button"
          onClick={handleReadClick}
          aria-label={`Читати книгу "${title}"`}
        >
          читати
        </button>
      </div>
    </div>
  );
};

const HomePage3 = () => {
  const { data: books } = useQuery({
    queryKey: ["books-recent-updates-homepage-3"],
    queryFn: () => mainAPI.getBooksRecentUpdates(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Дополнительная дедупликация на фронтенде для безопасности
  const uniqueBooks = React.useMemo(() => {
    if (!books || !Array.isArray(books)) return [];
    
    const seen = new Set();
    const unique = [];
    
    for (const book of books) {
      if (book.id && !seen.has(book.id)) {
        seen.add(book.id);
        unique.push(book);
      }
    }
    
    console.log('HomePage3: Дедупликация книг:', {
      original: books.length,
      unique: unique.length,
      books: unique.map(b => ({ 
        id: b.id, 
        title: b.title, 
        last_update: b.last_chapter_update,
        genres: b.genres,
        tags: b.tags,
        fandoms: b.fandoms
      }))
    });
    
    return unique;
  }, [books]);
  const sliderRef = useRef(null);
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
        breakpoint: 1366,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      }
    ],
  };
  return (
    <div className="main-container">
      <div className="header-container-homepage3">
        <span className="advertisement-homepage3">ОСТАННІ ОНОВЛЕННЯ</span>
        <div className="line-homepage3" />
      </div>

      <div className="novels-slider-wrapper">
        {uniqueBooks?.length > 0 ? (
          <Slider ref={sliderRef} {...settings}>
            {uniqueBooks.map((book) => (
              <NovelCard
                key={book.id}
                title={book.title}
                description={book.description}
                image={book.image}
                book_type={book.book_type}
                adult_content={book.adult_content}
                chapters_count={book.chapters_count}
                latest_chapter_title={book.latest_chapter_title}
                last_chapter_update={book.last_chapter_update}
                genres={book.genres || []}
                tags={book.tags || []}
                fandoms={book.fandoms || []}
                slug={book.slug}
              />
            ))}
          </Slider>
        ) : (
          <div className="no-books-message">Немає доступних книг з недавними оновленнями</div>
        )}
      </div>
    </div>
  );
};

export default HomePage3;
