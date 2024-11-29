import { api } from '../instance';

const fetchGenres = async () => {
    try {
        const response = await api.get('/catalog/genres/');
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні жанрів');
    }
};

const fetchTags = async () => {
    try {
        const response = await api.get('/catalog/tags/');
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні тегів');
    }
};

const fetchCountries = async () => {
    try {
        const response = await api.get('/catalog/countries/');
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні країн');
    }
};

const fetchFandoms = async () => {
    try {
        const response = await api.get('/catalog/fandoms/');
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні фандомів');
    }
};

const fetchBooks = async () => {
    const response = await api.get('/catalog/');
    return response.data;
};

const fetchBook = async (slug) => {
    const token = localStorage.getItem('token');
    const config = token ? {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    } : {};

    try {
        const response = await api.get(`/catalog/books/${slug}/`, config);
        return {
            ...response.data,
            translation_status_display: response.data.translation_status_display || 'Невідомо',
            original_status_display: response.data.original_status_display || 'Невідомо'
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Помилка при завантаженні книги');
    }
};

const getChapterList = async (bookSlug) => {
    const token = localStorage.getItem('token');
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    } : {
        'Accept': 'application/json'
    };
    
    try {
        const response = await api.get(
            `/catalog/books/${bookSlug}/chapters/`,
            { headers }
        );
        
        if (response.data) {
            return {
                data: response.data.map(chapter => ({
                    ...chapter,
                    position: parseFloat(chapter.position || 0)
                }))
            };
        }
        return response;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Книга не знайдена');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data.error || 'Помилка при завантаженні розділів');
        } else {
            throw new Error('Помилка сервера');
        }
    }
};

const getChapterDetail = async (bookSlug, chapterSlug) => {
    try {
        const response = await api.get(`/catalog/books/${bookSlug}/chapters/${chapterSlug}/`);
        return {
            data: {
                ...response.data,
                book: response.data.book || bookSlug,
                id: response.data.id || chapterSlug,
                book_id: response.data.book || bookSlug,
                book_title: response.data.book_title || ''
            }
        };
    } catch (error) {
        throw new Error('Помилка при завантаженні даних розділу');
    }
};

const uploadChapter = async (bookSlug, title, file, isPaid, selectedVolume = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необходима авторизация');
    }

    const formData = new FormData();
    
    if (title) {
        formData.append('title', title);
    } else {
        throw new Error('Название главы обязательно');
    }

    if (file) {
        formData.append('file', file);
    } else {
        throw new Error('Файл главы обязателен');
    }
    
    if (isPaid !== undefined && isPaid !== null) {
        formData.append('is_paid', String(isPaid));
    } else {
        formData.append('is_paid', 'false');
    }

    if (selectedVolume) {
        formData.append('volume', String(selectedVolume));
    }

    try {
        const response = await api.post(
            `/catalog/books/${bookSlug}/add_chapter/`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

const updateChapterOrder = async (volumeId, chapterOrders) => {
    const token = localStorage.getItem('token');
    
    const url = volumeId === 'no-volume' 
        ? `/catalog/chapters/update-order/` 
        : `/catalog/volumes/${volumeId}/update-order/`;

    try {
        const response = await api.post(
            url,
            { chapter_orders: chapterOrders },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

const updateChapterStatus = async (chapterId, isPaid) => {
    const token = localStorage.getItem('token');
    try {
        const response = await api.patch(
            `/catalog/chapters/${chapterId}/status/`,
            { is_paid: isPaid },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Помилка при оновленні статусу глави');
    }
};

const createBook = async (bookData) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необхідна авторизація');
    }

    const formData = new FormData();
    Object.keys(bookData).forEach(key => {
        if (key === 'image') {
            if (bookData[key]) {
                formData.append(key, bookData[key]);
            }
        } else if (Array.isArray(bookData[key])) {
            bookData[key].forEach(value => {
                formData.append(`${key}[]`, value);
            });
        } else {
            formData.append(key, bookData[key]);
        }
    });

    try {
        const response = await api.post('/catalog/books/create/', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 400) {
            throw new Error(error.response.data.message || 'Помилка валідації даних');
        }
        throw new Error('Помилка при створенні книги');
    }
};



const getOwnedBooks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необхідна авторизація');
    }

    try {
        const response = await api.get('/catalog/owned-books/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні книг користувача');
    }
};

const getBookTitle = async (bookSlug) => {
    try {
        const response = await api.get(`/catalog/books/${bookSlug}/title/`);
        return response.data.title;
    } catch (error) {
        throw new Error('Помилка при завантаженні назви книги');
    }
};

export const catalogAPI = {
    fetchGenres,
    fetchTags,
    fetchCountries,
    fetchFandoms,
    fetchBooks,
    fetchBook,
    getChapterList,
    getChapterDetail,
    uploadChapter,
    updateChapterOrder,
    updateChapterStatus,
    createBook,
    getOwnedBooks,
    getBookTitle,
};

export {
    fetchGenres,
    fetchTags,
    fetchCountries,
    fetchFandoms,
    fetchBooks,
    fetchBook,
    getChapterList,
    getChapterDetail,
    uploadChapter,
    updateChapterOrder,
    updateChapterStatus,
    createBook,
    getOwnedBooks,
    getBookTitle,
};