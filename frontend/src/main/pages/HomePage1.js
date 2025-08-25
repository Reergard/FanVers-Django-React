import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
// import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { mainAPI } from '../../api/main/mainAPI';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import "../styles/HomePage1.css";
import Slider from "react-slick";
import LeftArrow from "./img/left-arrow.png";
import RightArrow from "./img/right-arrow.png";
import OrangeDot from "./img/orange-dot.png";
import { Link, useNavigate } from "react-router-dom";
import BlueDot from "./img/blue-dot.png";
import { useSelector } from "react-redux";

const NovelCard = ({ title, description, image, slug }) => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const handleReadClick = async (e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    console.log('NovelCard: клик по кнопке "читати"', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги:', { title, slug });
      alert('Помилка: не вдалося завантажити сторінку книги');
      return;
    }

    try {
      // Проверяем, является ли текущий пользователь владельцем книги
      const bookInfo = await catalogAPI.getBookInfo(slug);
      const isOwner = isAuthenticated && currentUser && bookInfo.owner === currentUser.id;
      
      console.log('NovelCard: проверка владельца:', { 
        currentUserId: currentUser?.id, 
        bookOwnerId: bookInfo.owner, 
        isOwner 
      });

      // Переходим на соответствующую страницу
      if (isOwner) {
        console.log(`Переход на страницу владельца книги: ${slug}`);
        navigate(`/books/${slug}`);
      } else {
        console.log(`Переход на страницу читателя книги: ${slug}`);
        navigate(`/books/${slug}`);
      }
    } catch (error) {
      console.error('Ошибка при проверке владельца книги:', error);
      // В случае ошибки просто переходим на страницу книги
      navigate(`/books/${slug}`);
    }
  };

  const handleCardClick = async () => {
    console.log('NovelCard: клик по карточке', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги при клике по карточке:', { title, slug });
      alert('Помилка: не вдалося завантажити сторінку книги');
      return;
    }

    try {
      // Проверяем, является ли текущий пользователь владельцем книги
      const bookInfo = await catalogAPI.getBookInfo(slug);
      const isOwner = isAuthenticated && currentUser && bookInfo.owner === currentUser.id;
      
      console.log('NovelCard: проверка владельца (клик по карточке):', { 
        currentUserId: currentUser?.id, 
        bookOwnerId: bookInfo.owner, 
        isOwner 
      });

      // Переходим на соответствующую страницу
      if (isOwner) {
        console.log(`Переход на страницу владельца книги (клик по карточке): ${slug}`);
        navigate(`/books/${slug}`);
      } else {
        console.log(`Переход на страницу читателя книги (клик по карточке): ${slug}`);
        navigate(`/books/${slug}`);
      }
    } catch (error) {
      console.error('Ошибка при проверке владельца книги (клик по карточке):', error);
      // В случае ошибки просто переходим на страницу книги
      navigate(`/books/${slug}`);
    }
  };

  // Проверяем наличие обязательных данных
  if (!title || !slug) {
    console.warn('NovelCard: отсутствуют обязательные данные:', { title, slug });
    return (
      <div className="novel-card advertising-mobal error-card">
        <div className="error-content">
          <span className="error-title">Помилка завантаження</span>
          <span className="error-description">Книга недоступна</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="novel-card advertising-mobal"
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
          <div className="image-wrapper">
            <img
              src={image}
              alt={`Обкладинка книги "${title}"`}
              className="novel-image"
              onError={(e) => {
                console.warn(`Ошибка загрузки изображения для книги "${title}":`, e);
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div
              className="divider"
              role="separator"
              aria-orientation="vertical"
            />
            <span className="novel-letter">a</span>
          </div>
        </div>
      </div>
      <span className="novel-title-homepage">{title}</span>
      <span className="novel-description-homepage">
        {description && description.length > 150
          ? `${description.slice(0, 150)}...`
          : description || 'Опис відсутній'}
      </span>
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

const HomePage1 = () => {
  const { data: books, error, isLoading } = useQuery({
    queryKey: ["books-news"],
    queryFn: () => mainAPI.getBooksNews(),
  });

  // Логирование для отладки
  useEffect(() => {
    if (books) {
      console.log('HomePage1: получены книги:', books);
      books.forEach((book, index) => {
        console.log(`Книга ${index + 1}:`, {
          id: book.id,
          title: book.title,
          slug: book.slug,
          hasSlug: !!book.slug
        });
      });
    }
  }, [books]);

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('HomePage1: ошибка загрузки книг:', error);
    }
  }, [error]);

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
      },
    ],
  };
  
  return (
    <div className="main-container">
      <div className="header-container-homepage">
        <span className="advertisement-homepage">Реклама</span>
        <div className="line-homepage" />
      </div>

      <div className="novels-slider-wrapper">
        {isLoading ? (
          <div className="loading-message">Завантаження книг...</div>
        ) : error ? (
          <div className="error-message">Помилка завантаження: {error.message}</div>
        ) : books?.length > 0 ? (
          <Slider ref={sliderRef} {...settings}>
            {books.map((ad) => (
              <NovelCard
                key={ad.id}
                title={ad.title}
                description={ad.description}
                image={ad.image}
                slug={ad.slug}
              />
            ))}
          </Slider>
        ) : (
          <div className="no-books-message">Немає доступних книг</div>
        )}
      </div>
      
      {books?.length > 0 && (
        <div className="slider-controls">
          <button
            className="slider-btn left"
            onClick={() => sliderRef.current?.slickPrev()}
            aria-label="Попередня книга"
          >
            <img src={LeftArrow} alt="Попередня" />
            <img src={BlueDot} alt="Синій індикатор" />
          </button>
          <button
            className="slider-btn right"
            onClick={() => sliderRef.current?.slickNext()}
            aria-label="Наступна книга"
          >
            <img src={OrangeDot} alt="Помаранчевий індикатор" />
            <img src={RightArrow} alt="Наступна" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage1;
