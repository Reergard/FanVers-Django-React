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
        console.log('🔄 [Bootstrap] Refresh уже выполняется, пропускаем');
        return refreshInFlightRef.current;
      }
      
      console.log('🔄 [Bootstrap] === START REFRESH ===');
      console.log('🔄 [Bootstrap] Time:', new Date().toISOString());
      
      const refreshPromise = (async () => {
        try {
          // Получаем CSRF token перед refresh
          console.log('🔄 [Bootstrap] Шаг 1: Получаем CSRF token...');
          const csrfToken = await getCsrfToken(api);
          console.log('🔄 [Bootstrap] Шаг 1: CSRF token получен:', csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NULL');
          
          // ВАЖНО: refresh cookie имеет httponly=True, поэтому она НЕ доступна через document.cookie
          // Мы не можем проверить её наличие в JavaScript
          // Просто пытаемся сделать refresh запрос - если cookie нет, сервер вернет 401
          
          console.log('🔄 [Bootstrap] Шаг 2: Отправляем POST /users/refresh/');
          console.log('🔄 [Bootstrap] Шаг 2: Headers:', {
            'X-CSRFToken': csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NOT SET',
            'X-Requested-With': 'XMLHttpRequest'
          });
          
          const response = await api.post('/users/refresh/', null, { 
            headers: { 
              'X-CSRFToken': csrfToken,
              'X-Requested-With': 'XMLHttpRequest' 
            } 
          });
          
          console.log('🔄 [Bootstrap] Шаг 3: Ответ получен:', {
            status: response.status,
            hasAccess: !!response.data?.access,
            accessLength: response.data?.access?.length || 0
          });
          
          if (response.data?.access) {
            console.log('🔄 [Bootstrap] Шаг 4: Сохраняем access token в tokenService...');
            tokenService.setAccess(response.data.access);
            const saved = tokenService.hasAccess ? tokenService.hasAccess() : (tokenService.getAccessSync ? tokenService.getAccessSync() : null);
            console.log('🔄 [Bootstrap] Шаг 4: Token сохранен:', saved ? 'OK' : 'FAILED');
            
            console.log('🔄 [Bootstrap] Шаг 5: Обновляем Redux state (setHasToken(true))...');
            dispatch(setHasToken(true));
            console.log('🔄 [Bootstrap] === REFRESH SUCCESS ===');
          } else {
            console.warn('🔄 [Bootstrap] Шаг 4: В ответе нет access token!');
          }
          
          return response;
        } catch (error) {
          console.error('🔄 [Bootstrap] === REFRESH FAILED ===');
          console.error('🔄 [Bootstrap] Error status:', error.response?.status);
          console.error('🔄 [Bootstrap] Error data:', error.response?.data);
          console.error('🔄 [Bootstrap] Error message:', error.message);
          
          console.log('🔄 [Bootstrap] Обновляем Redux state (setHasToken(false))...');
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
      console.log('🔄 [Bootstrap] Focus event, обновляем токен');
      refresh();
    };
    
    const onVisible = () => { 
      if (document.visibilityState === 'visible') {
        console.log('🔄 [Bootstrap] Visibility change to visible, обновляем токен');
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
