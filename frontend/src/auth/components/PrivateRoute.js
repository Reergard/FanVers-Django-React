import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, isLoading: authLoading, hasToken } = useSelector(state => state.auth);

    // Пока грузим профиль — ничего не редиректим
    if (authLoading || (hasToken && !isAuthenticated)) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Завантаження профілю користувача...</p>
            </div>
        );
    }

    // Явно не авторизован и токена нет — пускаем на главную
    if (!isAuthenticated && !hasToken) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
};

export default PrivateRoute;
