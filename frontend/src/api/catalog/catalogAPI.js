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
    try {
        const response = await api.get('/catalog/books/reader/');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching books:', error);
        throw new Error('Помилка при завантаженні книг');
    }
};

const getBookInfo = async (slug) => {
    const token = localStorage.getItem('token');
    const config = token ? {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    } : {};

    try {
        const response = await api.get(`/catalog/books/info/${slug}/`, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching book info:', error);
        throw new Error('Помилка при завантаженні інформації про книгу');
    }
};

const fetchBook = async (slug) => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const config = token ? {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    } : {};

    try {
        const bookInfoResponse = await api.get(`/catalog/books/info/${slug}/`, config);
        const bookOwnerId = bookInfoResponse.data.owner;

        const endpoint = currentUser && currentUser.id === bookOwnerId 
            ? `/catalog/books/owner/${slug}/`
            : `/catalog/books/reader/${slug}/`;

        console.log('Fetching book from endpoint:', endpoint);
        const response = await api.get(endpoint, config);
        
        console.log('Book API response:', {
            slug,
            endpoint,
            data: response.data,
            genres: response.data.genres,
            tags: response.data.tags,
            fandoms: response.data.fandoms,
            country: response.data.country
        });

        return {
            ...response.data,
            translation_status_display: response.data.translation_status_display || 'Невідомо',
            original_status_display: response.data.original_status_display || 'Невідомо'
        };
    } catch (error) {
        console.error('Error fetching book:', error);
        throw new Error('Помилка при завантаженні книги');
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
        
        return {
            data: response.data.map(chapter => ({
                ...chapter,
                price: Number(chapter.price)
            }))
        };
    } catch (error) {
        throw error;
    }
};

const getChapterDetail = async (bookSlug, chapterSlug) => {
    const token = localStorage.getItem('token');
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    } : {
        'Accept': 'application/json'
    };

    try {
        console.log('Fetching chapter:', { bookSlug, chapterSlug });
        
        if (!bookSlug || !chapterSlug) {
            throw new Error('Відсутні необхідні параметри');
        }

        const response = await api.get(
            `/catalog/books/${bookSlug}/chapters/${chapterSlug}/`,
            { headers }
        );
        
        if (!response.data) {
            throw new Error('Відповідь сервера порожня');
        }

        // Проверяем обязательные поля
        if (!response.data.title || !response.data.content) {
            console.error('Missing required fields:', response.data);
            throw new Error('Неповні дані глави');
        }

        const chapterData = {
            ...response.data,
            book: response.data.book || bookSlug,
            id: response.data.id,
            book_id: response.data.book_id || response.data.book || bookSlug,
            book_title: response.data.book_title || '',
            content: response.data.content,
            title: response.data.title,
            slug: response.data.slug || chapterSlug
        };

        console.log('Processed chapter data:', chapterData);

        return {
            data: chapterData
        };
    } catch (error) {
        console.error('Chapter detail error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: `/catalog/books/${bookSlug}/chapters/${chapterSlug}/`
        });
        throw error;
    }
};

const uploadChapter = async (bookSlug, title, file, isPaid, selectedVolume = null, price = 1.00) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необхідна авторизація');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('is_paid', isPaid);
    formData.append('price', price.toString());

    if (selectedVolume) {
        formData.append('volume', selectedVolume.toString());
    }

    try {
        console.log('Sending data:', {
            title,
            isPaid,
            selectedVolume,
            price,
            hasFile: !!file
        });

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
        console.error('Upload error details:', {
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
        });
        
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        
        if (error.response?.status === 400) {
            throw new Error('Помилка валідації даних. Перевірте правильність заповнення всіх полів');
        }
        
        throw new Error('Помилка при створенні глави');
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

const deleteChapter = async (bookSlug, chapterId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Необхідна авторизація');
    }

    try {
        await api.delete(`/catalog/books/${bookSlug}/chapters/${chapterId}/delete/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Delete chapter error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Помилка при видаленні глави');
    }
};

const getVolumeList = async (bookSlug) => {
    try {
        const response = await api.get(`/catalog/books/${bookSlug}/volumes/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching volumes:', error);
        if (error.response?.status === 404) {
            throw new Error('Книга не знайдена');
        }
        throw new Error('Помилка при завантаженні томів');
    }
};

const fetchAbandonedTranslations = async () => {
    try {
        const response = await api.get('/catalog/abandoned-translations/');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching abandoned translations:', error);
        throw new Error('Помилка при завантаженні покинутих перекладів');
    }
};

export const catalogAPI = {
    fetchGenres,
    fetchTags,
    fetchCountries,
    fetchFandoms,
    fetchBooks,
    fetchBook,
    getBookInfo,
    getChapterList,
    getChapterDetail,
    uploadChapter,
    updateChapterOrder,
    updateChapterStatus,
    createBook,
    getOwnedBooks,
    getBookTitle,
    deleteChapter,
    getVolumeList,
    fetchAbandonedTranslations,
};

export {
    fetchGenres,
    fetchTags,
    fetchCountries,
    fetchFandoms,
    fetchBooks,
    fetchBook,
    getBookInfo,
    getChapterList,
    getChapterDetail,
    uploadChapter,
    updateChapterOrder,
    updateChapterStatus,
    createBook,
    getOwnedBooks,
    getBookTitle,
    deleteChapter,
    getVolumeList,
    fetchAbandonedTranslations,
};
