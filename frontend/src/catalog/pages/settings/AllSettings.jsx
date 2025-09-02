import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { catalogAPI } from '../../../api/catalog/catalogAPI';
import styles from "../../css/AllSettings.module.css";
import AccessRights from "./AccessRights";
import Advertising from "./Advertising";
import GeneralSettings from "./GeneralSettings";
import Subscription from "./Subscription";
import BgChapter from "../img/bg-chapter.png";
import { BreadCrumb } from '../../../main/components/BreadCrumb';

const TABS = {
    general: { label: "Книга", component: <GeneralSettings /> },
    subscription: { label: "Абонемент", component: <Subscription /> },
    advertising: { label: "Реклама на сайті", component: <Advertising /> },
    accessRights: { label: "Права доступу", component: <AccessRights /> },
};

function AllSettings() {
    const [activeTab, setActiveTab] = useState("general");
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useSelector(state => state.auth.user);
    const userInfo = useSelector(state => state.auth.userInfo);
    
    // Определяем, находимся ли мы в контексте книги
    const isBookContext = location.pathname.includes('/books/') && location.pathname.includes('/settings');
    
    // Загружаем данные книги только если мы в контексте книги
    const { data: book, isLoading } = useQuery({
        queryKey: ['book', slug],
        queryFn: () => catalogAPI.fetchBook(slug),
        enabled: !!slug && isBookContext,
    });

    // Проверяем права доступа к настройкам книги
    useEffect(() => {
        if (isBookContext && book && currentUser && userInfo) {
            const isOwner = book.owner === userInfo.id;
            
            if (!isOwner) {
                console.warn('AllSettings: Пользователь не является владельцем книги, перенаправляем');
                navigate(`/books/${slug}`, { 
                    replace: true,
                    state: { 
                        error: 'У вас немає прав для перегляду налаштувань цієї книги' 
                    }
                });
            }
        }
    }, [isBookContext, book, currentUser, userInfo, slug, navigate]);

    // Определяем breadcrumbs в зависимости от контекста
    const getBreadcrumbItems = () => {
        if (isBookContext && book) {
            return [
                { href: "/", label: "Головна" },
                { href: `/books/${slug}`, label: book.title || "Назва книги" },
                { href: `/books/${slug}/settings`, label: "Налаштування" },
            ];
        } else {
            return [
                { href: "/", label: "Головна" },
                { href: "/all-settings", label: "Налаштування" },
            ];
        }
    };

    if (isBookContext && isLoading) {
        return <div>Завантаження...</div>;
    }

    // Показываем сообщение о загрузке, если проверяем права доступа
    if (isBookContext && book && currentUser && userInfo) {
        const isOwner = book.owner === userInfo.id;
        if (!isOwner) {
            return <div>Перевірка прав доступу...</div>;
        }
    }

    return (
        <>
            <BreadCrumb items={getBreadcrumbItems()} />

            <div className={styles.HeaderAllSettings} style={{ 
                paddingBottom: activeTab === "advertising" ? "50px" : "20px", 
                borderBottom: activeTab === "advertising" ? "none" : "#fded01 1px solid", 
                justifyContent: activeTab === "advertising" ? "center" : "flex-start", 
                width: activeTab === "advertising" ? "70%" : "50%", 
            }}>
                {Object.entries(TABS).map(([key, { label }]) => (
                    key === "advertising" && activeTab === "advertising" ? (
                        // Если активна вкладка "Реклама" - заменяем кнопку на кастомный блок
                        <div className={styles.containerBlockNameChapter}> 
                            <div className={`block-name-chapter ${styles.BlockNameChapter}`} key={key}>
                                <img src={BgChapter} className={`top-chapter ${styles.TopChapter}`} />
                                <div className={`chapter-name ${styles.settingsHeader}`}>
                                    <span>Реклама</span>
                                </div>
                                <img src={BgChapter} className={`bot-chapter ${styles.BotChapter}`} />
                            </div>
                            <p>* Увага, після натискання на кнопку "Опублікувати" вартість реклами автоматично списується з вашого балансу.</p>
                        </div>
                    ) : (
                        // Обычные кнопки
                        <button
                            key={key}
                            className={activeTab === key ? styles.active : ""}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    )
                ))}
            </div>

            <div className={styles.Content}>{TABS[activeTab].component}</div>
        </>
    );
}

export default AllSettings;
