import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, forceLogout, setIsAuthenticated } from '../authSlice';
import { useLocation } from 'react-router-dom';
import tokenService from '../tokenService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const {
    user, isSuccess, isLoading, isError, userInfo, isAuthenticated
  } = useSelector((state) => state.auth);

  const requestedRef = useRef(false);
  const lastRequestTime = useRef(0);

  const isPublic = (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/activate') ||
    pathname.startsWith('/password')
  );

  useEffect(() => {
    const now = Date.now();
    const hasToken = !!localStorage.getItem('token');
    const timeSinceLastRequest = now - lastRequestTime.current;

    // Діагностичне логування - только при изменении условий
    if (import.meta.env.MODE === 'development') {
      console.log('useAuth: Перевірка умов:', {
        isPublic,
        hasToken,
        requestedRef: requestedRef.current,
        timeSinceLastRequest,
        isLoading,
        isError,
        userInfoExists: !!userInfo,
        userInfoKeys: userInfo ? Object.keys(userInfo).length : 0
      });
    }

    // Предотвращаем циклы - если уже загружаемся, не делаем ничего
    if (isLoading) {
      return;
    }

    // Гейт №1: не грузим профиль на публичных роутов
    if (isPublic) {
      requestedRef.current = false;
      // Если токена нет — гарантированно считаем неавторизованным,
      // чтобы логика редиректов со страницы логина не уносила на "/"
      const hasToken = !!localStorage.getItem('token');
      if (!hasToken) {
        if (isAuthenticated) dispatch(setIsAuthenticated(false));
      }
      return;
    }

    // Гейт №2: без токена не дергаем API вообще
    if (!hasToken) {
      console.log('useAuth: Немає токена, пропускаємо');
      requestedRef.current = false;
      // Устанавливаем isAuthenticated в false если нет токена
      if (isAuthenticated) {
        dispatch(setIsAuthenticated(false));
      }
      return;
    }

    // Гейт №2.5: если есть токен но нет userInfo, загружаем профиль
    if (hasToken && (!userInfo || Object.keys(userInfo).length === 0)) {
      // Продолжаем к загрузке профиля
    } else if (hasToken && userInfo && Object.keys(userInfo).length > 0) {
      // Если есть токен и userInfo, пользователь авторизован
      if (!isAuthenticated) {
        dispatch(setIsAuthenticated(true));
      }
      return;
    }

    // Гейт №3: не спамим, какщо вже відправляли запит
    if (requestedRef.current) {
      console.log('useAuth: Запит вже відправлено, пропускаємо');
      return;
    }

    // Гейт №4: мінімальний інтервал між запитами (1 секунда)
    if (timeSinceLastRequest < 1000) {
      console.log('useAuth: Занадто швидко, пропускаємо');
      return;
    }

    // Гейт №5: завантажуємо профіль тільки якщо немає userInfo
    if (!userInfo || Object.keys(userInfo).length === 0) {
      requestedRef.current = true;
      lastRequestTime.current = now;
      
      console.log('useAuth: Завантажуємо профіль користувача');
      
      dispatch(getProfile())
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            console.log('useAuth: Профіль успішно завантажено');
            dispatch(setIsAuthenticated(true));
          } else {
            console.log('useAuth: Помилка завантаження профілю');
            dispatch(setIsAuthenticated(false));
          }
        })
        .catch((error) => {
          console.error('useAuth: Критична помилка:', error);
          dispatch(setIsAuthenticated(false));
        })
        .finally(() => {
          // Дозволяємо повторну спробу через 5 секунд
          setTimeout(() => {
            requestedRef.current = false;
          }, 5000);
        });
    } else {
      console.log('useAuth: Профіль вже завантажено, пропускаємо');
      
      // Если у нас есть userInfo, значит пользователь авторизован
      if (userInfo && Object.keys(userInfo).length > 0) {
        dispatch(setIsAuthenticated(true));
      }
    }
  }, [dispatch, isLoading, isError, isPublic, pathname, userInfo]);

  // Дополнительный эффект для мониторинга токенов
  useEffect(() => {
    // ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ ТОКЕНОВ ДЛЯ ДИАГНОСТИКИ
    // if (!isPublic && isAuthenticated) {
    //   // Проверяем токены каждые 2 минуты
    //   const tokenCheckInterval = setInterval(async () => {
    //     try {
    //       const isValid = await tokenService.getValidToken();
    //       if (!isValid) {
    //         console.log('useAuth: Токени недійсні, виконуємо logout');
    //         dispatch(forceLogout());
    //       }
    //     } catch (error) {
    //       console.error('useAuth: Помилка перевірки токенів:', error);
    //       dispatch(forceLogout());
    //     }
    //   }, 2 * 60 * 1000); // 2 минуты

    //   return () => clearInterval(tokenCheckInterval);
    // }
  }, [dispatch, isPublic, isAuthenticated]);

  // Обработчик forceLogout для сброса локальных флагов
  useEffect(() => {
    const onForceLogout = () => {
      requestedRef.current = false;
      lastRequestTime.current = 0;
    };
    window.addEventListener('forceLogout', onForceLogout);
    return () => window.removeEventListener('forceLogout', onForceLogout);
  }, []);

  return { user, isSuccess, isLoading, isError, userInfo, isAuthenticated };
};
