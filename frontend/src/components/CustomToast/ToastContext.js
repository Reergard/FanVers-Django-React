import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import NotificationModal from './NotificationModal';
import { extractUserMessage } from '../../utils/errorHandler';
import './ToastContainer.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = ++toastIdCounter.current;
    // Нормализация входа: в UI только «чистый» текст
    const safeMessage = type === 'error'
      ? extractUserMessage(message, 'Сталася помилка')
      : (typeof message === 'string' ? message : extractUserMessage(message, ''));
    const newToast = { id, message: safeMessage, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Автоматически удаляем toast через указанное время
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((message, options = {}) => {
    addToast(message, 'success', options.duration || 5000);
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    addToast(message, 'error', options.duration || 5000);
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    addToast(message, 'warning', options.duration || 5000);
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    addToast(message, 'info', options.duration || 5000);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Компонент для отображения всех активных toast-уведомлений
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast-item">
          <NotificationModal 
            isOpen={true}
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
