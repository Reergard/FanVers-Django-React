import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/CustomToast';
import { useSelector } from 'react-redux';

const TranslatorAccessGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, userInfo, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { error: showError } = useToast();

  useEffect(() => {
    // Логируем только важные изменения состояния
    if (process.env.NODE_ENV === 'development') {
      console.log('TranslatorAccessGuard: Состояние изменилось:', {
        isAuthenticated,
        hasUser: !!user,
        hasUserInfo: !!userInfo,
        isLoading,
        userInfoKeys: userInfo ? Object.keys(userInfo).length : 0
      });
    }

    // Проверяем аутентификацию
    if (!isAuthenticated || !user) {
      console.log('TranslatorAccessGuard: Не аутентифицирован');
      showError('Для доступу до цієї сторінки необхідна авторизація');
      navigate('/login');
      return;
    }

    // Проверяем профиль пользователя
    if (!userInfo || Object.keys(userInfo).length === 0) {
      if (!isLoading) {
        console.log('TranslatorAccessGuard: Профиль не загружен');
        showError('Завантаження профілю користувача...');
      }
      return;
    }

    // Проверяем роль пользователя
    const userRole = userInfo?.role;
    console.log('TranslatorAccessGuard: Проверяем роль', { userRole });
    
    if (!userRole || (userRole !== 'Перекладач' && userRole !== 'Літератор')) {
      console.log('TranslatorAccessGuard: Недостаточные права', { userRole });
      showError('Ця функція доступна користувачам сайту, які належать до Перекладач або Літератор. На даний момент Ви Читач. Щоб мати можливість перекладати/публікувати тексти, необхідно змінити Тип профілю на Перекладач або Літератор.');
      navigate('/profile');
      return;
    }

    console.log('TranslatorAccessGuard: Все проверки пройдены успешно');
  }, [isAuthenticated, user, userInfo, isLoading, navigate, showError]);

  // Если загружается профиль, показываем загрузку
  if (isLoading || !userInfo || Object.keys(userInfo).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Завантаження профілю користувача...</p>
      </div>
    );
  }

  // Если не аутентифицирован, не показываем ничего
  if (!isAuthenticated || !user) {
    return null;
  }

  // Проверяем роль пользователя
  const userRole = userInfo?.role;
  if (!userRole || (userRole !== 'Перекладач' && userRole !== 'Літератор')) {
    return null;
  }

  // Если все проверки пройдены, отображаем содержимое
  return children;
};

export default TranslatorAccessGuard;
