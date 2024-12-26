import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mainAPI } from '../../api/main/mainAPI';
import '../styles/HomePage2.css';

// Импорты изображений
import coverImage from './img/1sr-glcht4s-1-1.png';
import backgroundImage from './img/------3-1-1.svg';
import starLight2 from './img/star-light-2.svg';
import starLight3 from './img/star-light-3.svg';
import rectangle6 from './img/rectangle-6-1.svg';
import navigation4 from './img/navigation4-1.svg';
import navigation5 from './img/navigation5-1.svg';
import line51 from './img/line-51-1.svg';

// Импорты звезд рейтинга
const starFills1 = [...Array(4)].map((_, i) => 
    require(`./img/star-fill-${8 + i}.svg`)
);

const starFills2 = [...Array(4)].map((_, i) => 
    require(`./img/star-fill-${12 + i}.svg`)
);

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
        <div className="homepage-pc screen">
            <div className="frame-123-hp28Hm">
                {currentBook?.image && (
                    <img
                        loading="lazy"
                        src={currentBook.image}
                        className="x1-sr-g-lcht4s-1-rUQU7Z"
                        alt={currentBook.title}
                        onError={(e) => {
                            console.log('Image load error:', currentBook.image);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <img 
                    className="x3-1-rUQU7Z" 
                    src={backgroundImage} 
                    alt="3 1" 
                />
                <div className="rating-rUQU7Z">
                    <div className="rating2-kpIWzg">
                        <div className="rectangle-3957"></div>
                        <div className="group-50-aNiaBw">
                            <img className="star_light" src={starLight2} alt="Star_light" />
                            {[...Array(4)].map((_, index) => (
                                <img 
                                    key={`star-fill-${index}`}
                                    className={`star_fill-${['hle15p', 'nlSlgt', 'Glaod1', 'BhyzBe'][index]} star_fill`}
                                    src={starFills1[index]}
                                    alt="Star_fill" 
                                />
                            ))}
                        </div>
                        <div className="text_label-aNiaBw text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                            якість перекладу
                        </div>
                    </div>
                    <div className="rating1-kpIWzg">
                        <div className="rectangle-3957"></div>
                        <div className="text_label-i2YPU0 text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                            рейтинг твору
                        </div>
                        <div className="group-49-i2YPU0">
                            <img className="star_light" src={starLight3} alt="Star_light" />
                            {[...Array(4)].map((_, index) => (
                                <img 
                                    key={`star-fill-2-${index}`}
                                    className={`star_fill-${['aIXtUm', 'MSv9cK', '9jjRNj', 'Z6M2St'][index]} star_fill`}
                                    src={starFills2[index]}
                                    alt="Star_fill" 
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-book-rUQU7Z">
                    <div className="text-S9xaSz">
                        <div className="rectangle-3956-Si3ny5"></div>
                        <p className="x-Si3ny5">
                            {currentBook?.description || 'Опис відсутній'}
                        </p>
                    </div>
                    <h1 className="text_label-S9xaSz text_label">
                        {currentBook?.title ? currentBook.title.toUpperCase() : 'Назва відсутня'}
                    </h1>
                    <div className="button-2-S9xaSz">
                        <img 
                            className="rectangle-6-dZjTXM" 
                            src={rectangle6} 
                            alt="Rectangle 6" 
                        />
                        <div className="text_label-dZjTXM text_label a-alleycaticg-alen-rus-regular-normal-tangerine-20px">
                            читати
                        </div>
                    </div>
                </div>
                <div className="navigation4-rUQU7Z navigation4">
                    <img 
                        className="navigation4-5fei5n navigation4" 
                        src={navigation4} 
                        alt="navigation4" 
                    />
                </div>
                <div className="navigation5-rUQU7Z navigation5">
                    <img 
                        className="navigation5-AiCfdu navigation5" 
                        src={navigation5} 
                        alt="navigation5" 
                    />
                </div>
                <div className="line-rUQU7Z">
                    <div className="text_label-ZCydxi text_label a-alleycaticg-alen-rus-regular-normal-pacific-blue-31px">
                        НОВИНКИ
                    </div>
                    <img 
                        className="line-51-ZCydxi" 
                        src={line51} 
                        alt="Line 51" 
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage2;