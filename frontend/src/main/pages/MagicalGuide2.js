import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
// import { websiteAdvertisingAPI } from "../../api/website_advertising/website_advertisingAPI";
import { mainAPI } from "../../api/main/mainAPI";
import "../styles/MagicalGuide.css";
import Slider from "react-slick";
import LeftArrow from "./img/left-arrow.png";
import RightArrow from "./img/right-arrow.png";
import OrangeDot from "./img/orange-dot.png";
import BlueDot from "./img/blue-dot.png";
import Rigth_light from "./img/right_light.png";

const NovelCard = ({ title, description, image, slug }) => {
  return (
    <div className="novel-card-magical">
      <div style={{ marginTop: "20px" }} className="novel-cover">
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
      <span className="novel-description-homepage">
        {description.length > 200
          ? `${description.slice(0, 200)}...`
          : description}
      </span>
    </div>
  );
};
const MagicalGuide2 = () => {
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
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <div className="main-container">
      <div className="header-container-homepage">
        <span className="advertisement-homepage">Рекомендації</span>
        <div className="line-homepage" />
      </div>

      <div className="novels-slider-wrapper">
        <div className="nav_recommendations">
          <div className="day">
            <span>Топ дня</span>
            <img src={Rigth_light} />
          </div>
          <div className="week">
            <span>Топ тижня</span>
            <img src={Rigth_light} />
          </div>
          <div className="month">
            <span>Топ місяця</span>
            <img src={Rigth_light} />
          </div>
          <div className="general">
            <span>Загальний Топ 15</span>
            <img src={Rigth_light} />
          </div>
        </div>
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
      <div className="slider-controls">
        <button
          className="slider-btn left"
          onClick={() => sliderRef.current.slickPrev()}
        >
          <img src={LeftArrow} />
          <img src={BlueDot} />
        </button>
        <button
          className="slider-btn right"
          onClick={() => sliderRef.current.slickNext()}
        >
          <img src={OrangeDot} />
          <img src={RightArrow} />
        </button>
      </div>
    </div>
  );
};

export default MagicalGuide2;
