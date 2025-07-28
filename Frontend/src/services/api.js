import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Movies API
export const getTrendingMovies = async () => {
  const response = await api.get('/movies/trending/movie');
  return response.data;
};

export const searchMovies = async (query) => {
  const response = await api.get('/movies/search', {
    params: { query, type: 'movie' }
  });
  return response.data;
};

// User API
export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// Watchlist API
export const getWatchlist = async () => {
  const response = await api.get('/users/watchlist');
  return response.data;
};

export const addToWatchlist = async (movieData) => {
  const response = await api.post('/users/watchlist', movieData);
  return response.data;
};

export const removeFromWatchlist = async (movieId) => {
  const response = await api.delete(`/users/watchlist/${movieId}`);
  return response.data;
};

// Export the api instance
export { api };
