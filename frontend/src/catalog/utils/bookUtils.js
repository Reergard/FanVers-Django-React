// Статусы перевода
export const TRANSLATION_STATUSES = {
    TRANSLATING: 'Перекладається',
    WAITING: 'В очікуванні розділів',
    PAUSED: 'Перерва',
    ABANDONED: 'Покинутий'
};

// Статусы оригинала
export const ORIGINAL_STATUSES = {
    ONGOING: 'Виходить',
    COMPLETED: 'Завершено',
    ABANDONED: 'Покинуто',
    PAUSED: 'На перерві'
};

// Получение метки статуса перевода
export const getTranslationStatusLabel = (status) => {
    return TRANSLATION_STATUSES[status] || status;
};

// Получение метки статуса оригинала
export const getOriginalStatusLabel = (status) => {
    return ORIGINAL_STATUSES[status] || status;
};

// Получение метки типа книги
export const getBookTypeLabel = (type) => {
    const bookTypes = {
        AUTHOR: 'Авторська',
        TRANSLATION: 'Переклад'
    };
    return bookTypes[type] || type;
}; 