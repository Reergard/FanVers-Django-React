import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';


export const fetchRating = async (slug) => {
  try {
//    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/rating/book/${slug}/rating/`
//    ,{
//      headers: {
//        'Authorization': `Bearer ${token}`
//      }
//    }
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const postRating = async (slug, score) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token not found');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/rating/book/${slug}/rating/`,
      { score },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting rating:', error);
    throw error;
  }
};
