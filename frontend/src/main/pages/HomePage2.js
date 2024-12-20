import React, { useState, useEffect } from 'react';
import styles from '../styles/NovelDetails.module.css';
import backgroundImage from '../images/NewBook1.svg';
import { useQuery } from '@tanstack/react-query';
import { mainAPI } from '../../api/main/mainAPI';

const HomePage2 = () => {
    const [currentBookIndex, setCurrentBookIndex] = useState(0);
    
    // Отримуємо список нових книг
    const { data: books } = useQuery({
        queryKey: ['books-news'],
        queryFn: () => mainAPI.getBooksNews(),
    });

    // Автоматичне перемикання книг кожні 10 секунд
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

    // Поточна книга для відображення
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
        </div>
    );
};

export default HomePage2;