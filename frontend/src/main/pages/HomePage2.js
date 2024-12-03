import React, { useState, useEffect } from 'react';
import { RatingDisplay } from '../../rating/components/RatingDisplay';
import styles from '../styles/NovelDetails.module.css';
import backgroundImage from '../images/NewBook1.svg';
import { useQuery } from '@tanstack/react-query';
import { mainAPI } from '../../api/main/mainAPI';

const HomePage2 = () => {
    const [currentBookIndex, setCurrentBookIndex] = useState(0);
    
    // Получаем список новых книг
    const { data: books } = useQuery({
        queryKey: ['books-news'],
        queryFn: () => mainAPI.getBooksNews(),
    });

    // Автоматическое переключение книг каждые 10 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            if (books && books.length > 0) {
                setCurrentBookIndex((prevIndex) => 
                    prevIndex === books.length - 1 ? 0 : prevIndex + 1
                );
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [books]);

    // Текущая книга для отображения
    const currentBook = books?.[currentBookIndex];

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <span className={styles.advertisement}>Новинки</span>
                <div className={styles.line} />
            </div>
            <img    
                loading="lazy"
                src={backgroundImage}
                className={styles.backgroundImage}
                alt=""
            />
            <div className={styles.contentWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.leftColumn}>
                        <div className={styles.ratingSection}>
                            <div className={styles.ratingGrid}>
                                <div className={styles.ratingColumn}>
                                    <RatingDisplay
                                        title="рейтинг твору"
                                        rating="https://cdn.builder.io/api/v1/image/assets/TEMP/d9245d4c1638c648a28ae6832017d281ac466d1b8805aaf15743c7c44d9fa7af?placeholderIfAbsent=true&apiKey=40d4639aa3a74de09e1a28d61cce350e"
                                    />
                                </div>
                                <div className={styles.coverColumn}>
                                    {currentBook?.image && (
                                        <img
                                            loading="lazy"
                                            src={currentBook.image}
                                            className={styles.coverImage}
                                            alt={currentBook.title}
                                            onError={(e) => {
                                                console.log('Image load error:', currentBook.image);
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.novelInfo}>
                            <h1 className={styles.title}>
                                {currentBook?.title ? currentBook.title.toUpperCase() : 'Назва відсутня'}
                            </h1>
                            <p className={styles.description}>
                                {currentBook?.description || 'Опис відсутній'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <RatingDisplay 
                title="якість перекладу"
                rating="https://cdn.builder.io/api/v1/image/assets/TEMP/e92f4b51df29a8eaaaf5a056203cfb7d68d8c72238e76a81d2df95c3be070a9f?placeholderIfAbsent=true&apiKey=40d4639aa3a74de09e1a28d61cce350e"
                className={styles.translationRating}
            />
        </div>
    );
};

export default HomePage2;