import React from 'react';
import styles from '../styles/RatingDisplay.module.css';

export const RatingDisplay = ({ title, rating, className }) => {
  return (
    <div className={`${styles.ratingContainer} ${className}`}>
      <div className={styles.ratingTitle}>{title}</div>
      <img
        loading="lazy"
        src={rating}
        className={styles.ratingStars}
        alt="Rating stars indicator"
      />
    </div>
  );
};