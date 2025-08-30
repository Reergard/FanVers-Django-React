import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/CustomToast';
import { useSelector } from 'react-redux';

const TranslatorAccessGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { error: showError } = useToast();

  // Проверяем аутентификацию
  if (!isAuthenticated || !user) {
    showError('Для доступу до цієї сторінки необхідна авторизація');
    navigate('/login');
    return null;
  }

  // Проверяем профиль пользователя
  if (!user.profile) {
    showError('Завантаження профілю користувача...');
    return null;
  }

  // Проверяем роль пользователя
  const userRole = user.profile?.role;
  if (!userRole || (userRole !== 'Перекладач' && userRole !== 'Літератор')) {
    showError('Ця функція доступна користувачам сайту, які належать до Перекладач або Літератор. На даний момент Ви Читач. Щоб мати можливість перекладати/публікувати тексти, необхідно змінити Тип профілю на Перекладач або Літератор.');
    navigate('/profile');
    return null;
  }

  // Если все проверки пройдены, отображаем содержимое
  return children;
};

export default TranslatorAccessGuard;
