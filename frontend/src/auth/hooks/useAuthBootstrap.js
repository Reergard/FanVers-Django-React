import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import tokenService from '../tokenService';
import { api } from '../../api/instance';
import { setHasToken } from '../authSlice';
import { getCsrfToken } from '../../utils/csrfToken';

/**
 * Хук для автоматического обновления токенов при загрузке/фокусе/видимости
 * Используется в корневом компоненте приложения
 * 
 * Защита от множественных запросов:
 * - Использует ref для отслеживания in-flight запросов
 * - Не запускает новый refresh, если предыдущий еще выполняется
 */
function useAuthBootstrap() {
  const dispatch = useDispatch();
  const refreshInFlightRef = useRef(null);
  
  useEffect(() => {
    const refresh = async () => {
      // Защита от множественных запросов
      if (refreshInFlightRef.current) {
        return refreshInFlightRef.current;
      }
      
      const refreshPromise = (async () => {
        try {
          // Получаем CSRF token перед refresh
          const csrfToken = await getCsrfToken(api);
          
          // ВАЖНО: refresh cookie имеет httponly=True, поэтому она НЕ доступна через document.cookie
          // Мы не можем проверить её наличие в JavaScript
          // Просто пытаемся сделать refresh запрос - если cookie нет, сервер вернет 401
          
          const response = await api.post('/users/refresh/', null, { 
            headers: { 
              'X-CSRFToken': csrfToken,
              'X-Requested-With': 'XMLHttpRequest' 
            } 
          });
          
          tokenService.setAccess(response.data?.access);
          dispatch(setHasToken(true));
          return response;
        } catch (error) {
          dispatch(setHasToken(false));
          // Молча игнорируем ошибки - пользователь остается гостем
          throw error;
        } finally {
          refreshInFlightRef.current = null;
        }
      })();
      
      refreshInFlightRef.current = refreshPromise;
      return refreshPromise;
    };

    // Сразу на загрузке вкладки
    refresh();

    const onFocus = () => {
      refresh();
    };
    
    const onVisible = () => { 
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}

export default useAuthBootstrap;
