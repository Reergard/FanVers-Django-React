// Сообщения об ошибках для каталога
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

// Функция для получения сообщения об ошибке
export const getCatalogErrorMessage = (field, code) => {
    return CATALOG_ERROR_MESSAGES[field]?.[code] || 'Невідома помилка';
};

// Функция для отображения ошибок через toast
export const handleCatalogApiError = (error, toast) => {
    if (error.response?.data?.errors) {
        error.response.data.errors.forEach(({ field, code }) => {
            const message = getCatalogErrorMessage(field, code);
            toast.error(message);
        });
    } else {
        toast.error('Помилка при виконанні операції. Спробуйте ще раз.');
    }
}; 