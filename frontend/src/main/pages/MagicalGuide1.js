import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { mainAPI } from '../../api/main/mainAPI';
import { analyticsBooksAPI } from '../../api/analytics_books/analytics_booksAPI';
import "../styles/MagicalGuide.css";
import { useQuery } from "@tanstack/react-query";
import Slider from "react-slick";

const NovelCard = ({ title, description, image, slug }) => {
  return (
    <div className="novel-card-magical">
      <div className="novel-cover magical">
        <div className="image-container magical-img">
          <div className="image-wrapper magical-img">
            <img
              src={image}
              alt={title}
              className="novel-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
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
      <div className="title-block-homepage">
        <span className="novel-title-homepage3">{title}</span>{" "}
        <div className="line-homepage-title3"></div>
      </div>
      <span className="novel-description-homepage">
        {description.length > 150
          ? `${description.slice(0, 150)}...`
          : description}
      </span>
    </div>
  );
};
const MagicalGuide1 = () => {
  // const [activeTab, setActiveTab] = useState('day');
  // const [trendingBooks, setTrendingBooks] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // const tabs = [
  //   { id: 'day', label: 'Топ дня' },
  //   { id: 'week', label: 'Топ тижня' },
  //   { id: 'month', label: 'Топ місяця' },
  //   { id: 'all_time', label: 'Загальний Топ 15' }
  // ];

  // useEffect(() => {
  //   fetchTrendingBooks(activeTab);
  // }, [activeTab]);

  // const fetchTrendingBooks = async (type) => {
  //   try {
  //     setLoading(true);
  //     const data = await analyticsBooksAPI.fetchTrendingBooks(type);
  //     setTrendingBooks(data);
  //     setError(null);
  //   } catch (err) {
  //     setError('Помилка при завантаженні трендів');
  //     console.error('Error fetching trending books:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const { data: books } = useQuery({
    queryKey: ["books-news"],
    queryFn: () => mainAPI.getBooksNews(),
  });
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
      }
    ],
  };
  return (
    <div className="main-container">
      <div className="header-container-homepage3">
        <span className="advertisement-Magical">ТРЕНДИ</span>
        <div className="line-homepage3" />
      </div>

      <div className="novels-slider-wrapper">
        {books?.length > 0 ? (
          <Slider ref={sliderRef} {...settings}>
            {books.map((ad) => (
              <NovelCard
                key={ad.id}
                title={ad.title}
                description={ad.description}
                image={ad.image}
              />
            ))}
          </Slider>
        ) : (
          <div className="no-books-message">Немає доступних книг</div>
        )}
      </div>
    </div>
  );
};

export default MagicalGuide1;
