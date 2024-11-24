import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/editors';

export const getChapterForEdit = async (chapterId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(
            `${API_BASE_URL}/chapters/${chapterId}/`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні даних розділу');
    }
};

export const updateChapter = async (chapterId, formData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(
            `${API_BASE_URL}/chapters/${chapterId}/update/`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Помилка при оновленні озділу');
    }
};

export const updateChapterOrder = async (volumeId, chapterOrders) => {
    console.log('=== Начало API запроса updateChapterOrder ===');
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
        console.error('Ошибка при обновлении порядка глав:', error);
        throw error;
    }
};
