import { api } from '../instance';
import { useQueryClient } from '@tanstack/react-query';

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

const getPaginatedChapters = async (bookId, startChapter = 1) => {
    try {
        if (!bookId) {
            console.warn('getPaginatedChapters: bookId is required');
            return { chapters: [], total_chapters: 0, page_ranges: [] };
        }
        
        console.log('Fetching paginated chapters for book:', bookId, 'starting from:', startChapter);
        
        const { data } = await api.get('/navigation/chapters/paginated/', {
            params: {
                book_id: bookId,
                start_chapter: startChapter
            }
        });
        
        console.log('Paginated chapters response:', data);
        return data;
    } catch (error) {
        console.error('Error in getPaginatedChapters:', {
            bookId,
            startChapter,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        // Handle specific error cases
        if (error.response?.status === 404) {
            console.warn('Book not found for paginated chapters, returning empty data');
            return { chapters: [], total_chapters: 0, page_ranges: [] };
        }
        
        if (error.response?.status === 400) {
            console.warn('Bad request for paginated chapters, returning empty data');
            return { chapters: [], total_chapters: 0, page_ranges: [] };
        }
        
        // For other errors, still return empty data to prevent crashes
        console.error('Unexpected error in getPaginatedChapters, returning empty data');
        return { chapters: [], total_chapters: 0, page_ranges: [] };
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

const addBookmark = async (bookId, status, queryClient) => {
    try {
        const { data } = await api.post('/navigation/bookmarks/', {
            book_id: bookId,
            status: status
        });
        if (queryClient) {
            queryClient.invalidateQueries(['readingStats']);
        }
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
    getPaginatedChapters,
    getBookmarksByStatus,
    addBookmark,
    updateBookmark,
    getBookmarkStatus
};

export {
    getChapterNavigation,
    getPaginatedChapters,
    getBookmarksByStatus,
    addBookmark,
    updateBookmark,
    getBookmarkStatus
};