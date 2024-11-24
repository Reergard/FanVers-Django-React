import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookmarksByStatus } from '../api';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import '../css/BookmarksPage.css'; 

const STATUS_LABELS = {
    'reading': 'Читаю',
    'dropped': 'Кинув читати',
    'planned': 'В планах',
    'completed': 'Прочитав',
};

const BookmarksPage = () => {
    const [activeStatus, setActiveStatus] = useState('reading');
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const token = localStorage.getItem('token');

    // Перемещаем useQuery до условного рендеринга
    const { data: bookmarks, isLoading, error } = useQuery({
        queryKey: ['bookmarks', activeStatus],
        queryFn: () => getBookmarksByStatus(activeStatus),
        enabled: !!isAuthenticated && !!token,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading) return <div>Завантаження...</div>;
    if (error) return <div>Помилка завантаження закладок: {error.message}</div>;

    return (
        <div className="bookmarks-page">
            <h1>Мої закладки</h1>
            <div className="bookmarks-tabs">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <button
                        key={status}
                        className={`tab ${activeStatus === status ? 'active' : ''}`}
                        onClick={() => setActiveStatus(status)}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="bookmarks-list">
                {bookmarks?.length ? (
                    bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="bookmark-item">
                            <a href={`/books/${bookmark.book.slug}`}>
                                {bookmark.book.title}
                            </a>
                        </div>
                    ))
                ) : (
                    <p>Немає закладок у цій категорії</p>
                )}
            </div>
        </div>
    );
};

export default BookmarksPage;
