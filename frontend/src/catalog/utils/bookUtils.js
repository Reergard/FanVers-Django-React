// Статуси перекладу
export const TRANSLATION_STATUSES = {
    TRANSLATING: 'Перекладається',
    WAITING: 'В очікуванні розділів',
    PAUSED: 'Перерва',
    ABANDONED: 'Покинутий'
};

// Статуси оригіналу
export const ORIGINAL_STATUSES = {
    ONGOING: 'Виходить',
    COMPLETED: 'Завершено',
    ABANDONED: 'Покинуто',
    PAUSED: 'На перерві'
};

// Отримання мітки статусу перекладу
export const getTranslationStatusLabel = (status) => {
    return TRANSLATION_STATUSES[status] || status;
};

// Отримання мітки статусу оригіналу
export const getOriginalStatusLabel = (status) => {
    return ORIGINAL_STATUSES[status] || status;
};

// Отримання мітки типу книги
export const getBookTypeLabel = (type) => {
    const bookTypes = {
        AUTHOR: 'Авторська',
        TRANSLATION: 'Переклад'
    };
    return bookTypes[type] || type;
}; 