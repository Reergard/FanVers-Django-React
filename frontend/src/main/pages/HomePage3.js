import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
// import { websiteAdvertisingAPI } from "../../api/website_advertising/website_advertisingAPI";
import { mainAPI } from "../../api/main/mainAPI";
import "../styles/HomePage3.css";
import Slider from "react-slick";

const ExpandableTags = ({ title, className, items }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <span>{title}:</span>
      <div className={`name-${className.split(" ")[0]}`}>
        {items.slice(0, 2).map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {items.length > 2 && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲" : "▼"}
          </button>
        )}
        {expanded &&
          items
            .slice(2)
            .map((item, index) => <span key={index + 2}>{item}</span>)}
      </div>
    </div>
  );
};

const NovelCard = ({ title, description, image }) => {
  return (
    <div className="novel-card homepage">
      <div className="novel-cover">
        <div className="image-container">
          <div className="image-wrapper">
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
      <div className="chapter-characteristic">
        <div className="chapter">
          <div className="number-chapter">
            <span>Розділ 1595</span>
            <p>:</p>
          </div>
          <div className="name-chapter">Вроджена Божественна Сила?</div>
        </div>
        <div className="all-tags">
          <ExpandableTags
            title="Фендом"
            className="fandom"
            items={["#гарри поттер"]}
          />
          <ExpandableTags
            title="Теги"
            className="tags"
            items={["#магия", "#хогвартс", "#волшебство"]}
          />
          <ExpandableTags
            title="Жанри"
            className="genres"
            items={["#фэнтези", "#приключения", "#магический реализм"]}
          />
        </div>
      </div>

      <div className="novel-button">
        <span className="read-button">читати</span>
      </div>
    </div>
  );
};

const HomePage3 = () => {
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

export default HomePage3;
