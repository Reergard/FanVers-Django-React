import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, forceLogout } from '../authSlice';
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

    // Діагностичне логування
    console.log('🔍 useAuth: Перевірка умов:', {
      isPublic,
      hasToken,
      requestedRef: requestedRef.current,
      timeSinceLastRequest,
      isLoading,
      isError,
      userInfoExists: !!userInfo,
      userInfoKeys: userInfo ? Object.keys(userInfo).length : 0
    });

    // Гейт №1: не грузим профиль на публичных роутов
    if (isPublic) {
      console.log('🚫 useAuth: Публічна сторінка, пропускаємо');
      requestedRef.current = false;
      return;
    }

    // Гейт №2: без токена не дергаем API вообще
    if (!hasToken) {
      console.log('🚫 useAuth: Немає токена, пропускаємо');
      requestedRef.current = false;
      return;
    }

    // Гейт №3: не спамим, якщо вже відправляли запит
    if (requestedRef.current) {
      console.log('🚫 useAuth: Запит вже відправлено, пропускаємо');
      return;
    }

    // Гейт №4: мінімальний інтервал між запитами (1 секунда)
    if (timeSinceLastRequest < 1000) {
      console.log('🚫 useAuth: Занадто швидко, пропускаємо');
      return;
    }

    // Гейт №5: додаткова перевірка для React Strict Mode
    // Перевіряємо, чи не завантажується вже профіль в Redux
    if (isLoading) {
      console.log('🚫 useAuth: Вже завантажується, пропускаємо');
      return;
    }

    // Гейт №6: логічні умови для завантаження профілю
    // Завантажуємо тільки якщо:
    // - Є токен
    // - Не завантажується
    // - Немає помилок
    // - Немає userInfo або userInfo порожній
    if (!isError && (!userInfo || Object.keys(userInfo).length === 0)) {
      requestedRef.current = true;
      lastRequestTime.current = now;
      
      console.log('🔄 useAuth: Завантажуємо профіль користувача');
      
      dispatch(getProfile())
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            console.log('✅ useAuth: Профіль успішно завантажено');
          } else {
            console.log('❌ useAuth: Помилка завантаження профілю');
          }
        })
        .catch((error) => {
          console.error('💥 useAuth: Критична помилка:', error);
        })
        .finally(() => {
          // Дозволяємо повторну спробу через 5 секунд
          setTimeout(() => {
            requestedRef.current = false;
          }, 5000);
        });
    } else {
      console.log('🚫 useAuth: Умови не виконані, пропускаємо');
    }
  }, [dispatch, isAuthenticated, isLoading, isError, userInfo, isPublic, pathname]);

  // Дополнительный эффект для мониторинга токенов
  useEffect(() => {
    if (!isPublic && isAuthenticated) {
      // Проверяем токены каждые 2 минуты
      const tokenCheckInterval = setInterval(async () => {
        try {
          const isValid = await tokenService.getValidToken();
          if (!isValid) {
            console.log('🔑 useAuth: Токени недійсні, виконуємо logout');
            dispatch(forceLogout());
          }
        } catch (error) {
          console.error('🔑 useAuth: Помилка перевірки токенів:', error);
          dispatch(forceLogout());
        }
      }, 2 * 60 * 1000); // 2 минуты

      return () => clearInterval(tokenCheckInterval);
    }
  }, [dispatch, isPublic, isAuthenticated]);

  return { user, isSuccess, isLoading, isError, userInfo, isAuthenticated };
};
