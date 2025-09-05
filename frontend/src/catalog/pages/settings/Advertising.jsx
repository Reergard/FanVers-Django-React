import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import styles from "../../css/AllSettings.module.css";
import { Form } from "react-bootstrap";
import buttonAdvertisingImg from "../img/Check_ring_light.svg";
import { catalogAPI } from '../../../api/catalog/catalogAPI';
import { websiteAdvertisingAPI } from '../../../api/website_advertising/website_advertisingAPI';
import { usersAPI } from '../../../api/users/usersAPI';
import { useToast } from "../../../components/CustomToast";

function Advertising() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { error: showError, success } = useToast();
    const userInfo = useSelector(state => state.auth.userInfo);

    // Состояния для рекламы
    const [mainPageDates, setMainPageDates] = useState({ startDate: '', endDate: '' });
    const [catalogDates, setCatalogDates] = useState({ startDate: '', endDate: '' });
    const [genresDates, setGenresDates] = useState({ startDate: '', endDate: '' });
    const [tagsDates, setTagsDates] = useState({ startDate: '', endDate: '' });
    const [fandomsDates, setFandomsDates] = useState({ startDate: '', endDate: '' });
    
    const [mainPageCost, setMainPageCost] = useState(0);
    const [catalogCost, setCatalogCost] = useState(0);
    const [genresCost, setGenresCost] = useState(0);
    const [tagsCost, setTagsCost] = useState(0);
    const [fandomsCost, setFandomsCost] = useState(0);
    
    const [mainPageOrdered, setMainPageOrdered] = useState(false);
    const [catalogOrdered, setCatalogOrdered] = useState(false);
    const [genresOrdered, setGenresOrdered] = useState(false);
    const [tagsOrdered, setTagsOrdered] = useState(false);
    const [fandomsOrdered, setFandomsOrdered] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Завантажуємо дані книги для перевірки власника
    const { data: book } = useQuery({
        queryKey: ['book', slug],
        queryFn: () => catalogAPI.fetchBook(slug),
        enabled: !!slug,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    // Завантажуємо баланс користувача
    const { data: userBalance, refetch: refetchBalance } = useQuery({
        queryKey: ['userBalance'],
        queryFn: () => usersAPI.getUserBalance(),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 2 * 60 * 1000, // 2 минуты
    });

    // Перевіряємо права доступу
    useEffect(() => {
        if (book && userInfo) {
            const isOwner = book.owner === userInfo.id;
            if (!isOwner) {
                showError('У вас немає прав для перегляду рекламних налаштувань цієї книги');
                navigate(`/books/${slug}`);
            }
        }
    }, [book, userInfo, slug, navigate, showError]);

    // Функция для расчета стоимости
    const calculateCost = async (startDate, endDate, costPerDay) => {
        if (!startDate || !endDate) return 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days * costPerDay;
    };

    // Обработчики изменения дат
    const handleMainPageDateChange = async (field, value) => {
        const newDates = { ...mainPageDates, [field]: value };
        setMainPageDates(newDates);
        setMainPageOrdered(false);
        
        if (newDates.startDate && newDates.endDate) {
            const cost = await calculateCost(newDates.startDate, newDates.endDate, 30);
            setMainPageCost(cost);
        } else {
            setMainPageCost(0);
        }
    };

    const handleCatalogDateChange = async (field, value) => {
        const newDates = { ...catalogDates, [field]: value };
        setCatalogDates(newDates);
        setCatalogOrdered(false);
        
        if (newDates.startDate && newDates.endDate) {
            const cost = await calculateCost(newDates.startDate, newDates.endDate, 15);
            setCatalogCost(cost);
        } else {
            setCatalogCost(0);
        }
    };

    const handleGenresDateChange = async (field, value) => {
        const newDates = { ...genresDates, [field]: value };
        setGenresDates(newDates);
        setGenresOrdered(false);
        
        if (newDates.startDate && newDates.endDate) {
            const cost = await calculateCost(newDates.startDate, newDates.endDate, 15);
            setGenresCost(cost);
        } else {
            setGenresCost(0);
        }
    };

    const handleTagsDateChange = async (field, value) => {
        const newDates = { ...tagsDates, [field]: value };
        setTagsDates(newDates);
        setTagsOrdered(false);
        
        if (newDates.startDate && newDates.endDate) {
            const cost = await calculateCost(newDates.startDate, newDates.endDate, 15);
            setTagsCost(cost);
        } else {
            setTagsCost(0);
        }
    };

    const handleFandomsDateChange = async (field, value) => {
        const newDates = { ...fandomsDates, [field]: value };
        setFandomsDates(newDates);
        setFandomsOrdered(false);
        
        if (newDates.startDate && newDates.endDate) {
            const cost = await calculateCost(newDates.startDate, newDates.endDate, 15);
            setFandomsCost(cost);
        } else {
            setFandomsCost(0);
        }
    };

    // Обработчики кнопок "Замовити"
    const handleMainPageOrder = async () => {
        if (!mainPageDates.startDate || !mainPageDates.endDate) {
            showError('Будь ласка, виберіть дати');
            return;
        }
        setMainPageOrdered(true);
        success('Вартість розраховано');
    };

    const handleCatalogOrder = async () => {
        if (!catalogDates.startDate || !catalogDates.endDate) {
            showError('Будь ласка, виберіть дати');
            return;
        }
        setCatalogOrdered(true);
        success('Вартість розраховано');
    };

    const handleGenresOrder = async () => {
        if (!genresDates.startDate || !genresDates.endDate) {
            showError('Будь ласка, виберіть дати');
            return;
        }
        setGenresOrdered(true);
        success('Вартість розраховано');
    };

    const handleTagsOrder = async () => {
        if (!tagsDates.startDate || !tagsDates.endDate) {
            showError('Будь ласка, виберіть дати');
            return;
        }
        setTagsOrdered(true);
        success('Вартість розраховано');
    };

    const handleFandomsOrder = async () => {
        if (!fandomsDates.startDate || !fandomsDates.endDate) {
            showError('Будь ласка, виберіть дати');
            return;
        }
        setFandomsOrdered(true);
        success('Вартість розраховано');
    };

    // Расчет общей стоимости
    const totalCost = (mainPageOrdered ? mainPageCost : 0) + 
                     (catalogOrdered ? catalogCost : 0) + 
                     (genresOrdered ? genresCost : 0) + 
                     (tagsOrdered ? tagsCost : 0) + 
                     (fandomsOrdered ? fandomsCost : 0);

    // Обработчик кнопки "Опублікувати"
    const handlePublish = async () => {
        if (!book?.id) {
            showError('Помилка: некоректні дані книги');
            return;
        }

        if (totalCost === 0) {
            showError('Будь ласка, замовте хоча б один тип реклами');
            return;
        }

        if (userBalance?.balance < totalCost) {
            showError('Недостатньо коштів на балансі');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Создаем рекламу для главной страницы (если заказана)
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

            // Создаем рекламу для каталога (если заказана)
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

            // Для остальных типов рекламы показываем сообщение о том, что они в разработке
            if (genresOrdered || tagsOrdered || fandomsOrdered) {
                showError('Реклама за жанрами, тегами та фендомами поки що в розробці. Створено тільки доступні типи реклами.');
            }

            await refetchBalance();
            success('Реклама успішно створена');
            navigate('/profile/my-advertisements');
        } catch (error) {
            if (error.message && error.message.includes('вже є активна реклама')) {
                showError(error.message);
            } else {
                showError(error.message || 'Помилка при створенні реклами');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Показуємо завантаження, якщо перевіряємо права
    if (book && userInfo) {
        const isOwner = book.owner === userInfo.id;
        if (!isOwner) {
            return <div>Перевірка прав доступу...</div>;
        }
    }

    return (
        <div className={styles.AdvertisingContainer}>

            <table className={styles.AdvertisingTable}>
                <tbody>
                    <tr>
                        {/* <td className={styles.centerAlign}></td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="main-page-checkbox"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                                checked={mainPageOrdered}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setMainPageOrdered(false);
                                        setMainPageCost(0);
                                    }
                                }}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама на головній (30 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.dateAdvertising}>
                                <input 
                                    type="date" 
                                    name="main-start-date" 
                                    value={mainPageDates.startDate}
                                    onChange={(e) => handleMainPageDateChange('startDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <input 
                                    type="date" 
                                    name="main-end-date" 
                                    value={mainPageDates.endDate}
                                    onChange={(e) => handleMainPageDateChange('endDate', e.target.value)}
                                    min={mainPageDates.startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="main-cost">Вартість:</label>
                                    <input 
                                        type="number" 
                                        id="main-cost" 
                                        name="main-cost" 
                                        value={mainPageCost}
                                        readOnly
                                    />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handleMainPageOrder}
                                disabled={!mainPageDates.startDate || !mainPageDates.endDate || mainPageOrdered}
                            >
                                <img src={buttonAdvertisingImg} />
                                {mainPageOrdered ? 'Замовлено' : 'Замовити'}
                            </button>
                        </td>
                    </tr>
                    <tr>
                        {/* <td className={styles.centerAlign}> </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="catalog-checkbox"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                                checked={catalogOrdered}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setCatalogOrdered(false);
                                        setCatalogCost(0);
                                    }
                                }}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама на сторінці Каталог
                                    (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.dateAdvertising}>
                                <input 
                                    type="date" 
                                    name="catalog-start-date" 
                                    value={catalogDates.startDate}
                                    onChange={(e) => handleCatalogDateChange('startDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <input 
                                    type="date" 
                                    name="catalog-end-date" 
                                    value={catalogDates.endDate}
                                    onChange={(e) => handleCatalogDateChange('endDate', e.target.value)}
                                    min={catalogDates.startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="catalog-cost">Вартість:</label>
                                    <input 
                                        type="number" 
                                        id="catalog-cost" 
                                        name="catalog-cost" 
                                        value={catalogCost}
                                        readOnly
                                    />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handleCatalogOrder}
                                disabled={!catalogDates.startDate || !catalogDates.endDate || catalogOrdered}
                            >
                                <img src={buttonAdvertisingImg} />
                                {catalogOrdered ? 'Замовлено' : 'Замовити'}
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                         
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="genres-checkbox"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                                checked={genresOrdered}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setGenresOrdered(false);
                                        setGenresCost(0);
                                    }
                                }}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за жанрами (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input 
                                        type="date" 
                                        name="genres-start-date" 
                                        value={genresDates.startDate}
                                        onChange={(e) => handleGenresDateChange('startDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <input 
                                        type="date" 
                                        name="genres-end-date" 
                                        value={genresDates.endDate}
                                        onChange={(e) => handleGenresDateChange('endDate', e.target.value)}
                                        min={genresDates.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть жанр</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="genres-select" className={styles.customSelect}>
                                            <option value="value1">Жанр 1</option>
                                            <option value="value2">Жанр 2</option>
                                            <option value="value3">Жанр 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="genres-cost">Вартість:</label>
                                    <input 
                                        type="number" 
                                        id="genres-cost" 
                                        name="genres-cost" 
                                        value={genresCost}
                                        readOnly
                                    />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handleGenresOrder}
                                disabled={!genresDates.startDate || !genresDates.endDate || genresOrdered}
                            >
                                <img src={buttonAdvertisingImg} />
                                {genresOrdered ? 'Замовлено' : 'Замовити'}
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="tags-checkbox"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                                checked={tagsOrdered}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setTagsOrdered(false);
                                        setTagsCost(0);
                                    }
                                }}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за тегами (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input 
                                        type="date" 
                                        name="tags-start-date" 
                                        value={tagsDates.startDate}
                                        onChange={(e) => handleTagsDateChange('startDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <input 
                                        type="date" 
                                        name="tags-end-date" 
                                        value={tagsDates.endDate}
                                        onChange={(e) => handleTagsDateChange('endDate', e.target.value)}
                                        min={tagsDates.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть теги</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="tags-select" className={styles.customSelect}>
                                            <option value="value1">Тег 1</option>
                                            <option value="value2">Тег 2</option>
                                            <option value="value3">Тег 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="tags-cost">Вартість:</label>
                                    <input 
                                        type="number" 
                                        id="tags-cost" 
                                        name="tags-cost" 
                                        value={tagsCost}
                                        readOnly
                                    />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handleTagsOrder}
                                disabled={!tagsDates.startDate || !tagsDates.endDate || tagsOrdered}
                            >
                                <img src={buttonAdvertisingImg} />
                                {tagsOrdered ? 'Замовлено' : 'Замовити'}
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="fandoms-checkbox"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                                checked={fandomsOrdered}
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setFandomsOrdered(false);
                                        setFandomsCost(0);
                                    }
                                }}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за фендом (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input 
                                        type="date" 
                                        name="fandoms-start-date" 
                                        value={fandomsDates.startDate}
                                        onChange={(e) => handleFandomsDateChange('startDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <input 
                                        type="date" 
                                        name="fandoms-end-date" 
                                        value={fandomsDates.endDate}
                                        onChange={(e) => handleFandomsDateChange('endDate', e.target.value)}
                                        min={fandomsDates.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть фендом</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="fandoms-select" className={styles.customSelect}>
                                            <option value="value1">Фендом 1</option>
                                            <option value="value2">Фендом 2</option>
                                            <option value="value3">Фендом 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="fandoms-cost">Вартість:</label>
                                    <input 
                                        type="number" 
                                        id="fandoms-cost" 
                                        name="fandoms-cost" 
                                        value={fandomsCost}
                                        readOnly
                                    />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handleFandomsOrder}
                                disabled={!fandomsDates.startDate || !fandomsDates.endDate || fandomsOrdered}
                            >
                                <img src={buttonAdvertisingImg} />
                                {fandomsOrdered ? 'Замовлено' : 'Замовити'}
                            </button>
                        </td>
                    </tr>
                    <tr className={`${styles.tableRow} ${styles.paddingRow}`}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <div className={styles.total}>
                                <p>Загальна вартість: {totalCost} FanCoins</p>
                                <p>Ваш баланс: {userBalance?.balance || 0} FanCoins</p>
                            </div>
                        </td>

                        <td style={{ marginRight: "30px" }}>
                            <button 
                                className={styles.buttonAdvertising}
                                onClick={handlePublish}
                                disabled={totalCost === 0 || isSubmitting}
                            >
                                <img src={buttonAdvertisingImg} />
                                {isSubmitting ? 'Публікація...' : 'Опублікувати'}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Advertising;
