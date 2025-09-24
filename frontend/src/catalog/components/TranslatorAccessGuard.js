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
    if (import.meta.env.MODE === 'development') {
      console.log('TranslatorAccessGuard: Состояние изменилось:', {
        isAuthenticated,
        hasUser: !!user,
        hasUserInfo: !!userInfo,
        isLoading,
        userInfoKeys: userInfo ? Object.keys(userInfo).length : 0
      });
    }

    // Проверяем наличие токена (основной индикатор авторизации)
    const hasToken = !!localStorage.getItem('token');
    
    // Если нет токена - точно не авторизован
    if (!hasToken) {
      console.log('TranslatorAccessGuard: Нет токена, не авторизован');
      showError('Для доступу до цієї сторінки необхідна авторизація');
      navigate('/login');
      return;
    }

    // Если есть токен, но профиль еще загружается - ждем
    if (isLoading || !userInfo || Object.keys(userInfo).length === 0) {
      console.log('TranslatorAccessGuard: Загружается профиль, ждем...');
      return;
    }

    // Проверяем роль пользователя только после загрузки профиля
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

  // Проверяем наличие токена
  const hasToken = !!localStorage.getItem('token');
  
  // Если нет токена - не показываем ничего
  if (!hasToken) {
    return null;
  }

  // Если загружается профиль, показываем загрузку
  if (isLoading || !userInfo || Object.keys(userInfo).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Завантаження профілю користувача...</p>
      </div>
    );
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
