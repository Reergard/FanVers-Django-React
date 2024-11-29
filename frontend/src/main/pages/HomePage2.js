import React from 'react';
import '../styles/HomePage2.css';
import backgroundImage from '../images/NewBook1.svg';

// Выносим константы на уровень модуля
const RATINGS_DATA = [
  { 
    title: "рейтинг твору", 
    imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/965dd8cf8a8301a8622ae9bd0821ad3fa8ebd14b42a38d556fdd3a19ff9df0ce?apiKey=40d4639aa3a74de09e1a28d61cce350e&" 
  },
  { 
    title: "якість перекладу", 
    imageSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/1a5c967d9924d6c4d794c115e0a93dabe2e791f892ad8ab8a4303b2b15f6c09c?apiKey=40d4639aa3a74de09e1a28d61cce350e&" 
  }
];

const BACKGROUND_IMAGE = backgroundImage;

// Преобразуем компоненты в стрелочные функции с неявным возвратом
const RatingDisplay = ({ title, imageSrc }) => (
  <div className="rating-display">
    <h2>{title}</h2>
    <img
      loading="lazy"
      src={imageSrc}
      alt={`${title} rating visualization`}
      className="rating-image"
    />
  </div>
);

const BookCover = () => <div className="book-cover-container"><div className="book-cover" /></div>;

const BookDescription = () => (
  <article className="book-description">
    <div className="description-content">
      <h1 className="book-title">ХАОТИЧНИЙ БОГ МЕЧА</h1>
      <p className="book-text">
        Цзянь Чен - загальновизнаний експерт, номер один у бойових
        мистецтвах Цзяньху. Його майстерність володіння мечем виходила
        за межі досконалості і була непереможною в бою. Після битви з
        видатним майстром Дугу Кьюбей, який зник безвісти понад сто
        років тому, Цзянь Чен не витримав поранень і помер.
        <br /><br />
        Після смерті Цзянь Чена виявився в абсолютно новому світі. Його
        швидкий розвиток привів до послідовного нападу ворогів, які
        завдали йому серйозних травм.
        <br />
        На порозі смерті його дух мутував, і з цього моменту він ступив
        на зовсім інший шлях мистецтва меча, щоб стати богом меча свого
        покоління.
      </p>
    </div>
  </article>
);

const Ratings = () => (
  <aside className="ratings-container">
    {RATINGS_DATA.map(({ title, imageSrc }, index) => (
      <RatingDisplay key={index} title={title} imageSrc={imageSrc} />
    ))}
  </aside>
);

const HomePage2 = () => (
  <main className="homepage-main">
    <img
      loading="lazy"
      src={BACKGROUND_IMAGE}
      alt="background"
      className="background-image"
    />
    <section className="content-section">
      <div className="content-wrapper">
        <div className="left-column">
          <div className="left-content">
            <div className="ratings-and-cover">
              <Ratings />
              <BookCover />
            </div>
          </div>
        </div>
        <BookDescription />
      </div>
    </section>
  </main>
);

export default HomePage2;