import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/catalog';

export const fetchGenres = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/genres/`);
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні жанрів');
    }
};

export const fetchTags = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tags/`);
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні тегів');
    }
};

export const fetchCountries = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/countries/`);
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні країн');
    }
};

export const fetchFandoms = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fandoms/`);
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні фандомів');
    }
};

export const fetchBooks = async () => {
  const response = await axios.get(`${API_BASE_URL}/`);
  return response.data;
};

export const fetchBook = async (slug) => {
    const token = localStorage.getItem('token');
    const config = token ? {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    } : {};

    try {
        const response = await axios.get(`${API_BASE_URL}/books/${slug}/`, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Помилка при завантаженні книги');
    }
};

export const getChapterList = async (bookSlug) => {
    const token = localStorage.getItem('token');
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    } : {
        'Accept': 'application/json'
    };
    
    try {
        const response = await axios.get(
            `${API_BASE_URL}/books/${bookSlug}/chapters/`,
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

export const getChapterDetail = (bookSlug, chapterSlug) => {
  const url = `${API_BASE_URL}/books/${bookSlug}/chapters/${chapterSlug}/`;
  return axios.get(url);
};

export const uploadChapter = async (bookSlug, title, file, isPaid, selectedVolume = null) => {
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
        const response = await axios.post(
            `${API_BASE_URL}/books/${bookSlug}/add_chapter/`, 
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

export const updateChapterOrder = async (volumeId, chapterOrders) => {
  const token = localStorage.getItem('token');
  
  const url = volumeId === 'no-volume' 
    ? `${API_BASE_URL}/chapters/update-order/` 
    : `${API_BASE_URL}/volumes/${volumeId}/update-order/`;

  try {
    const response = await axios.post(
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

export const updateChapterStatus = async (chapterId, isPaid) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/chapters/${chapterId}/status/`,
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
