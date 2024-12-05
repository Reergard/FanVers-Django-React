import { api } from '../instance';

// Функция для получения рейтингов книги
export const fetchBookRatings = async (bookSlug, token) => {
  try {
    const response = await api.get(`/rating/${bookSlug}/book-ratings/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    throw new Error('Ошибка при получении рейтингов: ' + 
      (error.response?.data?.error || error.message));
  }
};

// Функция для отправки оценки пользователя
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
    throw new Error('Ошибка при отправке оценки: ' + 
      (error.response?.data?.error || error.message));
  }
};

