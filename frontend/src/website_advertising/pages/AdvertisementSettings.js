import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { websiteAdvertisingAPI } from '../../api/website_advertising/website_advertisingAPI';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../api/users/usersAPI';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/AdvertisementSettings.css';

const AdvertisementSettings = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [selectedAd, setSelectedAd] = useState('main');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [totalCost, setTotalCost] = useState(0);
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Получаем информацию о балансе пользователя
    const { data: userBalance } = useQuery({
        queryKey: ['userBalance'],
        queryFn: () => usersAPI.getUserBalance()
    });

    const adTypes = [
        { id: 'main', name: 'Реклама на Головній', enabled: true },
        { id: 'genres', name: 'Реклама у Пошуку за жанрами', enabled: false },
        { id: 'tags', name: 'Реклама у Пошуку за тегами', enabled: false },
        { id: 'fandoms', name: 'Реклама у Пошуку за фендомами', enabled: false }
    ];

    // Загружаем данные книги при монтировании
    useEffect(() => {
        const fetchBookData = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching book data for slug:', slug);
                const bookData = await catalogAPI.fetchBook(slug);
                console.log('Loaded book data:', bookData);
                setBook(bookData);
            } catch (error) {
                console.error('Error loading book:', error);
                toast.error('Помилка при завантаженні даних книги');
                navigate('/profile/my-books');
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) {
            fetchBookData();
        }
    }, [slug, navigate]);

    const handleDateChange = async (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);

        if (start && end) {
            try {
                console.log('Selected dates:', { start, end });
                const response = await websiteAdvertisingAPI.calculateCost(start, end);
                setTotalCost(response.total_cost);
                console.log('Cost calculation successful:', response);
            } catch (error) {
                console.error('Cost calculation failed:', error);
                toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
            }
        }
    };

    const handleOrder = async () => {
        if (!startDate || !endDate) {
            toast.error('Будь ласка, виберіть дати');
            return;
        }

        try {
            const response = await websiteAdvertisingAPI.calculateCost(startDate, endDate);
            setTotalCost(response.total_cost);
            toast.success('Вартість розраховано');
        } catch (error) {
            toast.error('Помилка при розрахунку вартості');
        }
    };

    const handlePublish = async () => {
        console.log('Starting advertisement publication...');

        if (!book?.id) {
            toast.error('Помилка: некоректні дані книги');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Будь ласка, оберіть дати реклами');
            return;
        }

        try {
            const advertisementData = {
                book: book.id,
                location: selectedAd,
                start_date: startDate,
                end_date: endDate,
                total_cost: totalCost
            };

            console.log('Sending advertisement data:', advertisementData);
            
            const result = await websiteAdvertisingAPI.createAdvertisement(advertisementData);
            console.log('Advertisement created successfully:', result);
            
            toast.success('Реклама успішно створена');
            navigate('/profile/my-advertisements');
        } catch (error) {
            console.error('Error in handlePublish:', error);
            toast.error(error.message || 'Помилка при створенні реклами');
        }
    };

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    if (!book) {
        return <div>Книгу не знайдено</div>;
    }

    return (
        <div className="ad-settings-container">
            <h2>Налаштування реклами для книги "{book.title}"</h2>

            {adTypes.map(adType => (
                <div key={adType.id} className={`ad-block ${!adType.enabled ? 'disabled' : ''}`}>
                    <input
                        type="checkbox"
                        checked={selectedAd === adType.id}
                        onChange={() => adType.enabled && setSelectedAd(adType.id)}
                        disabled={!adType.enabled}
                    />
                    <span>{adType.name}</span>
                    
                    {adType.enabled && selectedAd === adType.id && (
                        <>
                            <div className="date-picker-container">
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDateChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Виберіть період"
                                />
                            </div>
                            <button onClick={handleOrder}>Замовити</button>
                        </>
                    )}
                </div>
            ))}

            <div className="total-cost">
                <span>Вартість: {totalCost} грн</span>
                <span>Баланс: {userBalance?.balance || 0} грн</span>
                <button 
                    onClick={handlePublish}
                    disabled={totalCost === 0 || !startDate || !endDate}
                >
                    Опублікувати
                </button>
            </div>
        </div>
    );
};

export default AdvertisementSettings; 