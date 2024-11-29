import { api } from '../instance';

const getChapterForEdit = async (chapterId) => {
    try {
        const response = await api.get(`/editors/chapters/${chapterId}/`);
        return response.data;
    } catch (error) {
        throw new Error('Помилка при завантаженні даних розділу');
    }
};

const updateChapter = async (chapterId, formData) => {
    try {
        const response = await api.put(
            `/editors/chapters/${chapterId}/update/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error('Помилка при оновленні розділу');
    }
};

const updateChapterOrder = async (volumeId, chapterOrders) => {
    const url = volumeId === 'no-volume' 
        ? `/editors/chapters/update-order/` 
        : `/editors/volumes/${volumeId}/update-order/`;
    
    try {
        const response = await api.post(url, { chapter_orders: chapterOrders });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const editorsAPI = {
    getChapterForEdit,
    updateChapter,
    updateChapterOrder,
    createErrorReport(data) {
        if (!data.book || !data.chapter) {
            throw new Error('Отсутствуют обязательные поля');
        }

        return api.post('/editors/error-reports/', {
            book: parseInt(data.book),
            chapter: parseInt(data.chapter),
            error_text: data.error_text,
            suggestion: data.suggestion,
            user_username: data.user_username,
            book_title: data.book_title,
            chapter_title: data.chapter_title
        }).catch(error => {
            if (error.response?.data?.error === 'no_owner') {
                throw new Error('NO_OWNER');
            }
            throw error;
        });
    },
    
    getErrorReport(id) {
        return api.get(`/editors/error-reports/${id}/`);
    }
};

export {
    getChapterForEdit,
    updateChapter,
    updateChapterOrder
};
