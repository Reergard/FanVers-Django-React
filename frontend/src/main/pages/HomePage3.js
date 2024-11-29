import React, { useEffect, useState } from 'react';
import '../styles/HomePage3.css';
import { catalogAPI } from '../../api';
import bookImage from '../assets/book.png';

const NovelCard = ({ title, description, imageUrl }) => {
    return (
        <div className="novel-card-alternative">      
            <div className="novel-cover-alt">
                <img src={imageUrl} alt={title} className="novel-image-alt" />
            </div>
            <div className="novel-content-alt">
                <h3 className="novel-title-alt">{title}</h3>
                <p className="novel-description-alt">{description}</p>
                <button className="read-button-alt">Детальніше</button>
            </div>
        </div>
    );
};

const Home3 = () => {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNovels = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const booksData = await catalogAPI.getBooks();

                if (!booksData) {
                    setError('Немає даних від сервера');
                    return;
                }

                if (!Array.isArray(booksData)) {
                    setError('Неправильний формат даних');
                    return;
                }

                const formattedNovels = booksData.map(book => ({
                    id: book.id,
                    title: book.title || 'Без назви',
                    description: book.description || 'Опис відсутній',
                    imageUrl: book.image || bookImage
                }));

                setNovels(formattedNovels);
            } catch (error) {
                setError('Помилка при завантаженні даних');
            } finally {
                setLoading(false);
            }
        };

        fetchNovels();
    }, []);

    return (
        <section className="home3-section">
            <h2 className="section-title">Нові надходження</h2>
            <div className="novels-grid">
                {loading ? (
                    <div className="loading-spinner">Завантаження...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : novels.length > 0 ? (
                    novels.map(novel => (
                        <NovelCard 
                            key={novel.id} 
                            {...novel} 
                        />
                    ))
                ) : (
                    <div className="no-novels">Немає доступних новел</div>
                )}
            </div>
        </section>
    );
};

export default Home3;