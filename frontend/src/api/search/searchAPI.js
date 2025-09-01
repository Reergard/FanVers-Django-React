import { api } from '../instance';

const searchBooks = async (filters = {}) => {
  try {
    // Строим query string из фильтров
    const queryParams = new URLSearchParams();
    
    // Основные фильтры
    if (filters.title && filters.title.trim()) queryParams.append('title', filters.title.trim());
    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach(genre => queryParams.append('genres', genre));
    }
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (filters.fandoms && filters.fandoms.length > 0) {
      filters.fandoms.forEach(fandom => queryParams.append('fandoms', fandom));
    }
    if (filters.countries && filters.countries.length > 0) {
      filters.countries.forEach(country => queryParams.append('countries', country));
    }
    
    // Исключающие фильтры
    if (filters.exclude_genres && filters.exclude_genres.length > 0) {
      filters.exclude_genres.forEach(genre => queryParams.append('exclude_genres', genre));
    }
    if (filters.exclude_tags && filters.exclude_tags.length > 0) {
      filters.exclude_tags.forEach(tag => queryParams.append('exclude_tags', tag));
    }
    if (filters.exclude_fandoms && filters.exclude_fandoms.length > 0) {
      filters.exclude_fandoms.forEach(fandom => queryParams.append('exclude_fandoms', fandom));
    }
    
    // Фильтры по количеству глав
    if (filters.min_chapters && filters.min_chapters !== "") queryParams.append('min_chapters', filters.min_chapters);
    if (filters.max_chapters && filters.max_chapters !== "") queryParams.append('max_chapters', filters.max_chapters);
    
    // Сортировка
    if (filters.order) queryParams.append('order', filters.order);
    
    // Фильтр по взрослому контенту
    if (filters.adult_content !== undefined) {
      queryParams.append('adult_content', filters.adult_content);
    }

    const response = await api.get(`/search/book-search/?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export const searchAPI = {
  searchBooks
};
