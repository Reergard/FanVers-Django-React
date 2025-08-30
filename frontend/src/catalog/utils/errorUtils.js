// Повідомлення про помилки для каталогу
import { extractUserMessage, logDeveloperError, cleanErrorMessage } from '../../utils/errorHandler';

export const CATALOG_ERROR_MESSAGES = {
    author: {
        blank: 'Ви не вказали Автора книги',
        required: 'Ви не вказали Автора книги',
    },
    title: {
        blank: 'Ви забули написати назву твору',
        required: 'Ви забули написати назву твору',
    },
    description: {
        blank: 'Ви не додали опис книги',
        required: 'Ви не додали опис книги',
    },
    genres: {
        required: 'Ви не обрали жанр',
        invalid: 'Невірно вказаний жанр',
    },
    country: {
        required: 'Ви не обрали країну',
        invalid: 'Невірно вказана країна',
    },
    book_type: {
        required: 'Ви не обрали тип твору',
        invalid: 'Невірно вказаний тип твору',
    },
    original_status: {
        required: 'Ви не вказали статус оригіналу',
        invalid: 'Невірно вказаний статус оригіналу',
    },
    chapter: {
        not_found: 'Главу не знайдено',
        access_denied: 'У вас немає прав для доступу до цієї глави',
        file_not_found: 'Файл глави не знайдено',
    },
    book: {
        not_found: 'Книгу не знайдено',
        create_error: 'Помилка при створенні книги',
        access_denied: 'У вас немає прав для редагування цієї книги',
    }
};

// Функція для отримання повідомлення про помилку
export const getCatalogErrorMessage = (field, code) => {
    return CATALOG_ERROR_MESSAGES[field]?.[code] || 'Невідома помилка';
};

/**
 * Утиліти для обробки помилок API каталогу
 */

/**
 * Обробляє помилки API каталогу та показує відповідні повідомлення
 * @param {Error} error - Об'єкт помилки
 * @param {Object} toast - Об'єкт з методами для показу повідомлень
 */
export const handleCatalogApiError = (error, toast) => {
  // Логуємо помилку для розробників
  logDeveloperError('Catalog API', error);

  // Отримуємо користувацьке повідомлення
  let errorMessage = extractUserMessage(error, 'Помилка при завантаженні даних');

  // Пытаемся получить детальное сообщение от сервера
  if (error.response?.data) {
    const { data } = error.response;
    // Пытаемся получить детальное сообщение от сервера
    if (data?.detail) {
      errorMessage = cleanErrorMessage(data.detail);
    } else if (data?.error) {
      errorMessage = cleanErrorMessage(data.error);
    } else if (data?.message) {
      errorMessage = cleanErrorMessage(data.message);
    } else if (data?.non_field_errors?.length > 0) {
      errorMessage = cleanErrorMessage(data.non_field_errors[0]);
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Общий случай: { field: ["msg"] }
      const [field, value] = Object.entries(data)[0] || [];
      const firstMsg = Array.isArray(value) && value.length ? String(value[0]) : null;
      if (field && firstMsg) {
        // если есть в словаре — используем его, иначе «очистим» сырой текст
        errorMessage = getCatalogErrorMessage(field, 'required') !== 'Невідома помилка'
          ? getCatalogErrorMessage(field, 'required')  // или подставь другой код при необходимости
          : cleanErrorMessage(firstMsg);
      } else {
        errorMessage = 'Невірний запит';
      }
    } else if (typeof data === 'string') {
      errorMessage = cleanErrorMessage(data);
    } else if (Array.isArray(data) && data.length > 0) {
      errorMessage = cleanErrorMessage(data[0]);
    } else {
      errorMessage = 'Невірний запит';
    }
  }

  // Показуємо повідомлення про помилку
  if (toast && toast.error) {
    toast.error(errorMessage);
  } else {
    console.error('Toast object not provided or missing error method');
  }

  return errorMessage;
}; 