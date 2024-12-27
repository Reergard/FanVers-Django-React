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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Получаем информацию о балансе пользователя
    const { data: userBalance, refetch: refetchBalance } = useQuery({
        queryKey: ['userBalance'],
        queryFn: () => usersAPI.getUserBalance(),
        refetchOnWindowFocus: true
    });

    const adTypes = [
        { id: 'main', name: 'Реклама на Головній', enabled: true },
        { id: 'genres', name: 'Реклама у Пошуку за жанрами', enabled: false },
        { id: 'tags', name: 'Реклама у Пошуку за тегами', enabled: false },
        { id: 'fandoms', name: 'Реклама у Пошуку за фендомами', enabled: false }
    ];

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                setIsLoading(true);
                const bookData = await catalogAPI.fetchBook(slug);
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
                const response = await websiteAdvertisingAPI.calculateCost(start, end);
                setTotalCost(response.total_cost);
            } catch (error) {
                toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
                setTotalCost(0);
            }
        } else {
            setTotalCost(0);
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
            toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
        }
    };

    const handlePublish = async () => {
        if (!book?.id) {
            toast.error('Помилка: некоректні дані книги');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Будь ласка, оберіть дати реклами');
            return;
        }

        if (totalCost === 0) {
            toast.error('Помилка: не розраховано вартість');
            return;
        }

        if (userBalance?.balance < totalCost) {
            toast.error('Недостатньо коштів на балансі');
            return;
        }

        try {
            setIsSubmitting(true);
            const advertisementData = {
                book: book.id,
                location: selectedAd,
                start_date: startDate,
                end_date: endDate,
                total_cost: totalCost
            };
            
            await websiteAdvertisingAPI.createAdvertisement(advertisementData);
            await refetchBalance();
            
            toast.success('Реклама успішно створена');
            navigate('/profile/my-advertisements');
        } catch (error) {
            if (error.message && error.message.includes('вже є активна реклама')) {
                toast.warning(error.message);
            } else {
                toast.error(error.message || 'Помилка при створенні реклами');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="loading-container">Завантаження...</div>;
    }

    if (!book) {
        return <div className="error-container">Книгу не знайдено</div>;
    }

    return (
        <div className="ad-settings-container">
            <h2>Налаштування реклами для книги "{book.title}"</h2>

            {adTypes.map(adType => (
                <div key={adType.id} className={`ad-block ${!adType.enabled ? 'disabled' : ''}`}>
                    <div className="ad-type-header">
                        <input
                            type="radio"
                            name="adType"
                            checked={selectedAd === adType.id}
                            onChange={() => adType.enabled && setSelectedAd(adType.id)}
                            disabled={!adType.enabled}
                        />
                        <span className={!adType.enabled ? 'disabled-text' : ''}>
                            {adType.name}
                            {!adType.enabled && ' (Скоро)'}
                        </span>
                    </div>
                    
                    {adType.enabled && selectedAd === adType.id && (
                        <div className="ad-details">
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
                                    className="custom-datepicker"
                                />
                            </div>
                            <button 
                                onClick={handleOrder}
                                className="order-button"
                                disabled={!startDate || !endDate}
                            >
                                Замовити
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div className="total-cost-container">
                <div className="cost-details">
                    <span>Вартість: {totalCost} грн</span>
                    <span>Баланс: {userBalance?.balance || 0} грн</span>
                </div>
                <button 
                    onClick={handlePublish}
                    disabled={totalCost === 0 || !startDate || !endDate || isSubmitting}
                    className="publish-button"
                >
                    {isSubmitting ? 'Публікація...' : 'Опублікувати'}
                </button>
            </div>
        </div>
    );
};

export default AdvertisementSettings; 