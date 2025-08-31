import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/CustomToast';
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import TranslatorAccessGuard from '../../catalog/components/TranslatorAccessGuard';
import { BreadCrumb } from '../../main/components/BreadCrumb';

const NovelCard = ({ title, description, image, startDate, endDate, location, book_type }) => {
    const locationNames = {
        'main': 'Головна сторінка',
        'genres': 'Пошук за жанрами',
        'tags': 'Пошук за тегами',
        'fandoms': 'Пошук за фендомами'
    };

    return (
        <div className="novel-card">
            <div className="novel-cover">
                <div className="image-container">
                    <div className="image-wrapper">
                        <img 
                            src={image} 
                            alt={title} 
                            className="novel-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }} 
                        />
                        <div className="divider" role="separator" aria-orientation="vertical" />
                        {book_type === 'AUTHOR' && (
                          <span className="novel-letter">a</span>
                        )}
                    </div>
                </div>
            </div>
            <span className="novel-title">{title}</span>
            <div className="novel-divider" />
            <div className="novel-info">
                <span className="novel-location">Розміщення: {locationNames[location]}</span>
                <span className="novel-dates">
                    Період: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </span>
            </div>
            <span className="novel-description">{description}</span>
        </div>
    );
};

const AdvertisementsUsers = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError } = useToast();

  useEffect(() => {
    const loadAdvertisements = async () => {
      try {
        const data = await websiteAdvertisingAPI.getUserAdvertisements();
        setAdvertisements(data);
      } catch (error) {
        console.error('Помилка при завантаженні реклами:', error);
        showError('Помилка при завантаженні реклами');
        setIsLoading(false);
      }
    };

    loadAdvertisements();
  }, [showError]);

    if (isLoading) {
        return <div className="loading">Завантаження...</div>;
    }

    if (!advertisements.length) {
        return <div className="no-ads">У вас поки немає активних рекламних оголошень</div>;
    }

    return (
        <div className="main-container">
            <div className="header-container">
                <span className="advertisement">Мої рекламні оголошення</span>
                <div className="line" />
            </div>
            <div className="novels-container">
                {advertisements.map(ad => (
                    <NovelCard 
                        key={ad.id}
                        title={ad.book_details.title}
                        description={ad.book_details.description}
                        image={ad.book_details.image}
                        startDate={ad.start_date}
                        endDate={ad.end_date}
                        location={ad.location}
                        book_type={ad.book_details.book_type}
                    />
                ))}
            </div>
            <div className="tabi" />
        </div>
    );
};

export default AdvertisementsUsers; 