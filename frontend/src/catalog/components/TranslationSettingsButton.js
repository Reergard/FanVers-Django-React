import React from 'react';
import { Link } from 'react-router-dom';
import SettingsBook from '../pages/img/Setting.svg';
import './css/TranslationSettingsButton.css';

const TranslationSettingsButton = ({ bookSlug }) => {
  return (
    <Link to={`/books/${bookSlug}/settings`} className="translation-settings-button">
      <img src={SettingsBook} alt="Settings" />
      <span>Налаштування перекладу</span>
    </Link>
  );
};

export default TranslationSettingsButton;
