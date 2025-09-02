import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogAPI } from '../api/catalog/catalogAPI';
import { useToast } from '../components/CustomToast';

/**
 * Хук для перевірки доступу до книги та безпечного переходу
 */
export const useBookAccess = () => {
    const navigate = useNavigate();
    const { error: showError } = useToast();

    const checkAccessAndNavigate = useCallback(async (bookSlug, bookTitle = '') => {
        try {
            const accessData = await catalogAPI.checkBookAccess(bookSlug);
            
            if (accessData.has_access) {
                // Доступ дозволено - переходимо на сторінку книги
                navigate(`/books/${bookSlug}`);
            } else {
                // Доступ заборонено - показуємо повідомлення
                const message = accessData.message || 'Власник цієї книги обмежив доступ до неї';
                showError(message);
            }
        } catch (error) {
            console.error('Error checking book access:', error);
            showError(error.message || 'Помилка при перевірці доступу до книги');
        }
    }, [navigate, showError]);

    return {
        checkAccessAndNavigate
    };
};
