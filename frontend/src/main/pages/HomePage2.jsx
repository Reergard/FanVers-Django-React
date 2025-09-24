import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { mainAPI } from '../../api/main/mainAPI';
import "../styles/HomePage2.css";

// Импорты изображений
import coverImage from "./img/1sr-glcht4s-1-1.png";
import backgroundImage from "./img/------3-1-1.svg";
import navigation4 from "./img/navigation4-1.svg";
import navigation5 from "./img/navigation5-1.svg";
import line51 from "./img/line-51-1.svg";
import LeftArrow from "./img/left-arrow.png";
import RightArrow from "./img/right-arrow.png";
import OrangeDot from "./img/orange-dot.png";
import { Link } from "react-router-dom";
import BlueDot from "./img/blue-dot.png";
import BookImg from "./img/book-homepages.svg";
import BookRatingComponent from '../../rating/components/BookRatingComponent';
// Импорты звезд рейтинга
import starFill8 from "./img/star-fill-8.svg";
import starFill9 from "./img/star-fill-9.svg";
import starFill10 from "./img/star-fill-10.svg";
import starFill11 from "./img/star-fill-11.svg";
import starFill12 from "./img/star-fill-12.svg";
import starFill13 from "./img/star-fill-13.svg";
import starFill14 from "./img/star-fill-14.svg";
import starFill15 from "./img/star-fill-15.svg";

const starFills1 = [starFill8, starFill9, starFill10, starFill11];
const starFills2 = [starFill12, starFill13, starFill14, starFill15];

const HomePage2 = () => {
  const navigate = useNavigate();
  
  // Получаем список новых книг
  const { data: books } = useQuery({
    queryKey: ["books-news-homepage-2"],
    queryFn: () => mainAPI.getBooksNews(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Автоматическое переключение книг каждые 5 минут (оптимизация для throttling)
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  useEffect(() => {
    // Проверяем, что books существует и является массивом
    if (!books || !Array.isArray(books) || books.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBookIndex((prevIndex) =>
        (prevIndex + 1) % books.length
      );
    }, 300000); // 5 минут = 300000 мс

    return () => clearInterval(interval);
  }, [books?.length]); // Используем только длину массива как зависимость

  const handleNext = () => {
    if (!books || !Array.isArray(books) || books.length === 0) return;
    setCurrentBookIndex((prev) => (prev + 1) % books.length);
  };
  
  const handlePrev = () => {
    if (!books || !Array.isArray(books) || books.length === 0) return;
    setCurrentBookIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  // Обработчик для перехода на страницу книги
  const handleBookClick = () => {
    if (currentBook?.slug) {
      navigate(`/books/${currentBook.slug}`);
    }
  };

  // Текущая книга для отображения
  const currentBook = books?.[currentBookIndex];

  // Логирование для отладки
  useEffect(() => {
    if (currentBook) {
      console.log('HomePage2: Текущая книга в карусели:', {
        title: currentBook.title,
        slug: currentBook.slug,
        index: currentBookIndex
      });
    }
  }, [currentBookIndex, books?.length]);

  // Показываем загрузку или ошибку если нет данных
  if (!books || !Array.isArray(books) || books.length === 0) {
    return (
      <div className="homepage-pc screen">
        <div className="line-rUQU7Z">
          <h2>НОВИНКИ</h2>
          <div className="line-51-ZCydxi"></div>
        </div>
        <div className="frame-123-hp28Hm">
          <div className="mobile-container-homepage">
            <h1 className="text_label-S9xaSz text_label mobile">
              Завантаження новинок...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-pc screen">
       <div className="line-rUQU7Z">
          <h2>
            НОВИНКИ
          </h2>
          <div className="line-51-ZCydxi"></div>
        </div>
      <div className="frame-123-hp28Hm">
        <div className="mobile-container-homepage">
          <h1 className="text_label-S9xaSz text_label mobile">
            {currentBook?.title
              ? currentBook.title.toUpperCase()
              : "Назва відсутня"}
          </h1>
          <div className="mobile-container-img">
            {currentBook?.image && (
              <img
                loading="lazy"
                src={currentBook.image}
                className="x1-sr-g-lcht4s-1-rUQU7Z"
                alt={currentBook.title}
                onError={(e) => {
                  console.log("Image load error:", currentBook.image);
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            )}
            <img 
              className="x3-1-rUQU7Z" 
              src={backgroundImage} 
              alt="3 1" 
              onClick={handleBookClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="container-home-page">
              <div className="rating-rUQU7Z">
                {currentBook && (
                  <>
                    <div className="rating2-kpIWzg">
                      <div className="group-50-aNiaBw">
                        <BookRatingComponent
                          key={`translation-${currentBook.slug}`}
                          bookSlug={currentBook.slug}
                          ratingType="TRANSLATION"
                          title=""
                          compact={true}
                          onRatingUpdate={() => {
                            console.log('Рейтинг перекладу оновлено в карусели');
                          }}
                        />
                      </div>
                      <div className="text_label-aNiaBw text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                        якість перекладу
                      </div>
                    </div>
                    <div className="rating1-kpIWzg">
                      <div className="text_label-i2YPU0 text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                        рейтинг твору
                      </div>
                      <div className="group-49-i2YPU0">
                        <BookRatingComponent
                          key={`book-${currentBook.slug}`}
                          bookSlug={currentBook.slug}
                          ratingType="BOOK"
                          title=""
                          compact={true}
                          onRatingUpdate={() => {
                            console.log('Рейтинг твору оновлено в карусели');
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <img 
                src={BookImg} 
                className="book-img" 
                onClick={handleBookClick}
                style={{ cursor: 'pointer' }}
                alt="Перейти к книзі"
              />
              <div className="text-book-rUQU7Z">
                <div className="text-S9xaSz">
                  <h1 className="text_label-S9xaSz text_label pc">
                    {currentBook?.title
                      ? currentBook.title.toUpperCase()
                      : "Назва відсутня"}
                  </h1>
                  <p className="x-Si3ny5 pc">
                    {currentBook?.description.length > 500
                      ? `${currentBook?.description.slice(0, 500)}...`
                      : currentBook?.description}
                  </p>
                  <div 
                    className="read_button" 
                    onClick={handleBookClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="text_label-dZjTXM text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                      читати
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="x-Si3ny5 mobile">
            {currentBook?.description.length > 500
              ? `${currentBook?.description.slice(0, 500)}...`
              : currentBook?.description}
          </p>
        </div>
        <div className="all-nav">
          <div className="navigation4-rUQU7Z navigation4">
            <img
              className="navigation4-5fei5n navigation4"
              src={window.innerWidth < 990 ? LeftArrow : navigation4}
              onClick={handlePrev}
              alt="navigation4"
            />
            {window.innerWidth < 990 && (
              <img
                className="navigation4-5fei5n navigation4"
                src={window.innerWidth < 990 && BlueDot}
                onClick={handlePrev}
                alt="navigation4"
              />
            )}
          </div>
          <div className="navigation5-rUQU7Z navigation5">
            <img
              className="navigation5-AiCfdu navigation5"
              src={window.innerWidth < 990 ? RightArrow : navigation5}
              onClick={handleNext}
              alt="navigation5"
            />
            {window.innerWidth < 990 && (
              <img
                className="navigation5-AiCfdu navigation5"
                src={OrangeDot}
                onClick={handleNext}
                alt="navigation5"
              />
            )}
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default HomePage2;
