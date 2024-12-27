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
    const [mainPageDates, setMainPageDates] = useState({ startDate: null, endDate: null });
    const [catalogDates, setCatalogDates] = useState({ startDate: null, endDate: null });
    const [mainPageCost, setMainPageCost] = useState(0);
    const [catalogCost, setCatalogCost] = useState(0);
    const [mainPageOrdered, setMainPageOrdered] = useState(false);
    const [catalogOrdered, setCatalogOrdered] = useState(false);
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: userBalance, refetch: refetchBalance } = useQuery({
        queryKey: ['userBalance'],
        queryFn: () => usersAPI.getUserBalance(),
        refetchOnWindowFocus: true
    });

    const totalCost = mainPageOrdered ? mainPageCost : 0 + catalogOrdered ? catalogCost : 0;

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

    const handleMainPageDateChange = async (dates) => {
        const [start, end] = dates;
        setMainPageDates({ startDate: start, endDate: end });
        setMainPageOrdered(false);

        if (start && end) {
            try {
                const response = await websiteAdvertisingAPI.calculateCost(start, end);
                setMainPageCost(response.total_cost);
            } catch (error) {
                toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
                setMainPageCost(0);
            }
        } else {
            setMainPageCost(0);
        }
    };

    const handleCatalogDateChange = async (dates) => {
        const [start, end] = dates;
        setCatalogDates({ startDate: start, endDate: end });
        setCatalogOrdered(false);

        if (start && end) {
            try {
                const response = await websiteAdvertisingAPI.calculateCost(start, end);
                setCatalogCost(response.total_cost);
            } catch (error) {
                toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
                setCatalogCost(0);
            }
        } else {
            setCatalogCost(0);
        }
    };

    const handleMainPageOrder = async () => {
        if (!mainPageDates.startDate || !mainPageDates.endDate) {
            toast.error('Будь ласка, виберіть дати');
            return;
        }

        try {
            const response = await websiteAdvertisingAPI.calculateCost(mainPageDates.startDate, mainPageDates.endDate);
            setMainPageCost(response.total_cost);
            setMainPageOrdered(true);
            toast.success('Вартість розраховано');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
            setMainPageOrdered(false);
        }
    };

    const handleCatalogOrder = async () => {
        if (!catalogDates.startDate || !catalogDates.endDate) {
            toast.error('Будь ласка, виберіть дати');
            return;
        }

        try {
            const response = await websiteAdvertisingAPI.calculateCost(catalogDates.startDate, catalogDates.endDate);
            setCatalogCost(response.total_cost);
            setCatalogOrdered(true);
            toast.success('Вартість розраховано');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при розрахунку вартості');
            setCatalogOrdered(false);
        }
    };

    const handlePublish = async () => {
        if (!book?.id) {
            toast.error('Помилка: некоректні дані книги');
            return;
        }

        if (!mainPageOrdered && !catalogOrdered) {
            toast.error('Будь ласка, замовте хоча б один тип реклами');
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
            
            if (mainPageOrdered) {
                const mainPageData = {
                    book: book.id,
                    location: 'main',
                    start_date: mainPageDates.startDate,
                    end_date: mainPageDates.endDate,
                    total_cost: mainPageCost
                };
                await websiteAdvertisingAPI.createAdvertisement(mainPageData);
            }

            if (catalogOrdered) {
                const catalogData = {
                    book: book.id,
                    location: 'catalog',
                    start_date: catalogDates.startDate,
                    end_date: catalogDates.endDate,
                    total_cost: catalogCost
                };
                await websiteAdvertisingAPI.createAdvertisement(catalogData);
            }

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

            <div className="ad-block">
                <div className="ad-type-header">
                    <h3>Реклама на Головній</h3>
                </div>
                <div className="ad-details">
                    <div className="date-picker-container">
                        <DatePicker
                            selected={mainPageDates.startDate}
                            onChange={handleMainPageDateChange}
                            startDate={mainPageDates.startDate}
                            endDate={mainPageDates.endDate}
                            selectsRange
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Виберіть період"
                            className="custom-datepicker"
                        />
                    </div>
                    <div className="cost-details">
                        <span>Вартість: {mainPageCost} грн</span>
                    </div>
                    <div className="buttons-container">
                        <button 
                            onClick={handleMainPageOrder}
                            className="order-button"
                            disabled={!mainPageDates.startDate || !mainPageDates.endDate}
                        >
                            Замовити
                        </button>
                    </div>
                </div>
            </div>

            <div className="ad-block">
                <div className="ad-type-header">
                    <h3>Реклама в Каталозі</h3>
                </div>
                <div className="ad-details">
                    <div className="date-picker-container">
                        <DatePicker
                            selected={catalogDates.startDate}
                            onChange={handleCatalogDateChange}
                            startDate={catalogDates.startDate}
                            endDate={catalogDates.endDate}
                            selectsRange
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Виберіть період"
                            className="custom-datepicker"
                        />
                    </div>
                    <div className="cost-details">
                        <span>Вартість: {catalogCost} грн</span>
                    </div>
                    <div className="buttons-container">
                        <button 
                            onClick={handleCatalogOrder}
                            className="order-button"
                            disabled={!catalogDates.startDate || !catalogDates.endDate}
                        >
                            Замовити
                        </button>
                    </div>
                </div>
            </div>

            <div className="total-container">
                <div className="total-cost">
                    <span>Загальна вартість: {totalCost} грн</span>
                    <span>Ваш баланс: {userBalance?.balance || 0} грн</span>
                </div>
                <button 
                    onClick={handlePublish}
                    disabled={totalCost === 0 || (!mainPageOrdered && !catalogOrdered) || isSubmitting}
                    className="publish-button"
                >
                    {isSubmitting ? 'Публікація...' : 'Опублікувати'}
                </button>
            </div>
        </div>
    );
};

export default AdvertisementSettings; 