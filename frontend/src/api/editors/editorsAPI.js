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
    updateChapterOrder
};

export {
    getChapterForEdit,
    updateChapter,
    updateChapterOrder
};
