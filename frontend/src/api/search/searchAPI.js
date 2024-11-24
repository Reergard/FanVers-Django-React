import { api } from '../instance';

const searchBooks = async (query) => {
  try {
    const response = await api.get(`/search/book-search/?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};

export const searchAPI = {
    searchBooks
};

export { searchBooks };