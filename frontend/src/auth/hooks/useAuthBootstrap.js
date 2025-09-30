import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import tokenService from '../tokenService';
import { api } from '../../api/instance';
import { setHasToken } from '../authSlice';

/**
 * Хук для автоматического обновления токенов при загрузке/фокусе/видимости
 * Используется в корневом компоненте приложения
 */
function useAuthBootstrap() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const refresh = () =>
      api.post('/users/refresh/', null, { 
        headers: { 'X-Requested-With': 'XMLHttpRequest' } 
      })
        .then((r) => {
          tokenService.setAccess(r.data?.access);
          dispatch(setHasToken(true));
          console.log('Bootstrap: токен обновлен');
        })
        .catch(() => {
          dispatch(setHasToken(false));
          // Молча игнорируем ошибки - пользователь остается гостем
          console.log('Bootstrap: refresh не удался, пользователь остается гостем');
        });

    // Сразу на загрузке вкладки
    refresh();

    const onFocus = () => {
      console.log('Bootstrap: focus event, обновляем токен');
      refresh();
    };
    
    const onVisible = () => { 
      if (document.visibilityState === 'visible') {
        console.log('Bootstrap: visibility change to visible, обновляем токен');
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
