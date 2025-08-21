import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TranslatorAccessGuard = ({ children }) => {
  const currentUser = useSelector(state => state.auth.user);
  const userInfo = useSelector(state => state.auth.userInfo);

  // Логування для діагностики
  console.log('TranslatorAccessGuard Debug:', {
    currentUser,
    userInfo,
    userRole: userInfo?.role,
    isAuthenticated: !!currentUser
  });

  // Проверяем роль пользователя
  const isTranslator = userInfo?.role === 'Перекладач' || userInfo?.role === 'Літератор';
  const isReader = userInfo?.role === 'Читач';

  // Если пользователь не авторизован
  if (!currentUser) {
    toast.error('Для доступу до цієї сторінки необхідна авторизація');
    return <Navigate to="/login" replace />;
  }

  // Если роль не определена, показываем сообщение
  if (!userInfo || !userInfo.role) {
    toast.error('Завантаження профілю користувача...');
    return <div>Завантаження...</div>;
  }

  // Если пользователь читатель
  if (isReader) {
    toast.error('Ця функція доступна користувачам сайту, які належать до Перекладач або Літератор. На даний момент Ви Читач. Щоб мати можливість перекладати/публікувати тексти, необхідно змінити Тип профілю на сторінці Профілю!');
    return <Navigate to="/profile" replace />;
  }

  // Если пользователь переводчик или литератор
  if (isTranslator) {
    return children;
  }

  // Если роль не определена, показываем сообщение
  toast.error('Не вдалося визначити роль користувача');
  return <Navigate to="/profile" replace />;
};

export default TranslatorAccessGuard;
