import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/search';

export const searchBooks = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/book-search/?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};
