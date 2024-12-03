import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import '../styles/HomePage1.css';

const NovelCard = ({ title, description, image }) => {
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

const HomePage1 = () => {
    const { data: advertisedBooks, isLoading, error } = useQuery({
        queryKey: ['mainPageAds'],
        queryFn: websiteAdvertisingAPI.getMainPageAds,
        onSuccess: (data) => {
            console.log('Successfully loaded advertisements:', data);
        },
        onError: (error) => {
            console.error('Error loading advertisements:', error);
        }
    });

    if (isLoading) {
        console.log('Loading advertisements...');
        return <div>Loading...</div>;
    }
    
    if (error) {
        console.error('Error in HomePage1:', error);
        return <div>Error loading advertisements</div>;
    }

    console.log('Rendering advertisements:', advertisedBooks);

    return (
        <div className="main-container">
            <div className="header-container">
                <span className="advertisement">Реклама</span>
                <div className="line" />
            </div>
            <div className="novels-container">
                {advertisedBooks?.map(ad => (
                    <NovelCard 
                        key={ad.id}
                        title={ad.book_details.title}
                        description={ad.book_details.description}
                        image={ad.book_details.image}
                    />
                ))}
            </div>
            <div className="tabi" />
        </div>
    );
};

export default HomePage1;