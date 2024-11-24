import { api } from '../instance';

const getChapterNavigation = async (bookSlug, chapterSlug) => {
    try {
        const response = await api.get(
            `/navigation/books/${bookSlug}/chapters/${chapterSlug}/navigation/`
        );
        return response;
    } catch (error) {
        throw error;
    }
};

const getBookmarksByStatus = async (status) => {
    try {
        const { data } = await api.get(`/navigation/bookmarks/status/${status}/`);
        return data;
    } catch (error) {
        throw error;
    }
};

const addBookmark = async (bookId, status) => {
    try {
        const { data } = await api.post('/navigation/bookmarks/', {
            book_id: bookId,
            status: status
        });
        return data;
    } catch (error) {
        throw error;
    }
};

const updateBookmark = async (bookmarkId, status) => {
    try {
        const { data } = await api.patch(`/navigation/bookmarks/${bookmarkId}/`, {
            status: status
        });
        return data;
    } catch (error) {
        throw error;
    }
};

const getBookmarkStatus = async (bookId) => {
    try {
        const { data } = await api.get(`/navigation/bookmarks/status/${bookId}/`);
        return data;
    } catch (error) {
        return null;
    }
};

export const navigationAPI = {
    getChapterNavigation,
    getBookmarksByStatus,
    addBookmark,
    updateBookmark,
    getBookmarkStatus
};

export {
    getChapterNavigation,
    getBookmarksByStatus,
    addBookmark,
    updateBookmark,
    getBookmarkStatus
};