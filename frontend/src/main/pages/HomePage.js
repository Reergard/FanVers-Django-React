import React from 'react';
import '../styles/HomePage.css';
import Home2 from "./HomePage2";
import Home3 from "./HomePage3";
import bookImage from '../assets/book.png';
import { useAuth } from '../../auth/hooks/useAuth';

// Данные новелл
const novelData = [
  {
    id: 1,
    title: 'ХАОТИЧНИЙ БОГ МЕЧА',
    description: 'Цзянь Чен - загальновизнаний експерт, номер один у бойових мистецтвах Цзяньху. Його майстерність володіння мечем виходила за межі досконалості і була непереможною в бою. Після битви з видатним майстром Дугу Кьюбей, який зник безвісти понад сто років тому, Цзянь Чен не витримав поранень і помер...',
    imageUrl: bookImage
  },
  {
    id: 2,
    title: 'ХАОТИЧНИЙ БОГ МЕЧА',
    description: 'Цзянь Чен - загальновизнаний експерт, номер один у бойових мистецтвах Цзяньху...',
    imageUrl: bookImage
  },
  // ... остальные новеллы
];

const NovelCard = ({ title, description, imageUrl }) => {
  return (
    <div className="novel-card">      
      <div className="novel-cover">
        <div className="image-container">
          <div className="image-wrapper">
            <img src={imageUrl} alt={title} className="novel-image" />
            <span className="novel-letter">a</span>
          </div>
        </div>
      </div>
      <span className="novel-title">{title}</span>
      <div className="novel-divider" />
      <span className="novel-description">{description}</span>
      <div className="novel-button">
        <span className="read-button">читати</span>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { userInfo, isAuthenticated, user } = useAuth();

  return (
    <div className="homepage-wrapper">      
      <div className="home-page">
        <div className="main-container">
          <div className="header-container">
            <span className="advertisement">Реклама</span>
            <div className="line" />
          </div>
          <div className="novels-container">
            {novelData.map(novel => (
              <NovelCard key={novel.id} {...novel} />
            ))}
          </div>
          <div className="tabi" />
        </div>

        
        
        <Home2 />
        <Home3 />
      </div>
    </div>
  );
};

export default HomePage;