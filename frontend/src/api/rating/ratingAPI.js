import { api } from '../instance';

// Функція для отримання рейтингів книги
export const fetchBookRatings = async (bookSlug, token) => {
  try {
    const response = await api.get(`/rating/${bookSlug}/book-ratings/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    throw new Error('Помилка при отриманні рейтингів: ' + 
      (error.response?.data?.error || error.message));
  }
};

// Функція для надсилання оцінки користувача
export const submitRating = async (bookSlug, ratingType, rating, token) => {
  try {
    const response = await api.post(
      '/rating/ratings/',
      {
        book_slug: bookSlug,
        rating_type: ratingType,
        rating: parseInt(rating)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Помилка при надсиланні оцінки: ' + 
      (error.response?.data?.error || error.message));
  }
};

