import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
// import { mainAPI } from '../../api/main/mainAPI';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import "../styles/HomePage1.css";
import Slider from "react-slick";
import LeftArrow from "./img/left-arrow.png";
import RightArrow from "./img/right-arrow.png";
import OrangeDot from "./img/orange-dot.png";
import { Link, useNavigate } from "react-router-dom";
import BlueDot from "./img/blue-dot.png";
import { useSelector } from "react-redux";
import AdultIcon from "../../catalog/pages/img/18.svg";
import { useBookAccess } from "../../hooks/useBookAccess";

const NovelCard = ({ title, description, image, slug, book_type, adult_content }) => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { checkAccessAndNavigate } = useBookAccess();
  


  const handleReadClick = async (e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    console.log('NovelCard: клик по кнопке "читати"', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги:', { title, slug });
      alert('Помилка: не вдалося завантажити сторінку книги');
      return;
    }

    // Используем новый хук для проверки доступа
    await checkAccessAndNavigate(slug, title);
  };

  const handleCardClick = async () => {
    console.log('NovelCard: клик по карточке', { title, slug });
    
    if (!slug) {
      console.warn('Отсутствует slug для книги при клике по карточке:', { title, slug });
      alert('Помилка: не вдалося завантажити сторінку книги');
      return;
    }

    // Используем новый хук для проверки доступа
    await checkAccessAndNavigate(slug, title);
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
    queryKey: ["main-page-ads"],
    queryFn: () => websiteAdvertisingAPI.getMainPageAds(),
  });

  // Логирование для отладки
  useEffect(() => {
    if (books) {
      console.log('HomePage1: получены рекламные объявления:', books);
      books.forEach((ad, index) => {
        console.log(`Рекламное объявление ${index + 1}:`, {
          id: ad.id,
          book_title: ad.book_details?.title,
          book_slug: ad.book_details?.slug,
          location: ad.location,
          start_date: ad.start_date,
          end_date: ad.end_date,
          total_cost: ad.total_cost
        });
      });
    }
  }, [books]);

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('HomePage1: ошибка загрузки рекламных объявлений:', error);
    }
  }, [error]);

  const sliderRef = useRef(null);
  
  const settings = {
    infinite: books?.length > 1,
    speed: 500,
    slidesToShow: Math.min(4, books?.length || 1),
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: books?.length > 1,
    dots: false,
    responsive: [
      {
        breakpoint: 1366,
        settings: {
          slidesToShow: Math.min(3, books?.length || 1),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, books?.length || 1),
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
          <div className="loading-message">Завантаження реклами...</div>
        ) : error ? (
          <div className="error-message">Помилка завантаження реклами: {error.message}</div>
        ) : books?.length > 0 ? (
          <Slider ref={sliderRef} {...settings}>
            {books.map((ad) => (
              <NovelCard
                key={ad.id}
                title={ad.book_details?.title}
                description={ad.book_details?.description}
                image={ad.book_details?.image}
                slug={ad.book_details?.slug}
                book_type={ad.book_details?.book_type}
                adult_content={ad.book_details?.adult_content}
              />
            ))}
          </Slider>
        ) : (
          <div className="no-books-message">Немає активних рекламних оголошень</div>
        )}
      </div>
      
      {books?.length > 1 && (
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
