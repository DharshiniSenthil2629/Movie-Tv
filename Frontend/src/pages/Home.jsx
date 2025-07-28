import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SearchGrid from '../components/SearchGrid';
import { Box, Typography, CircularProgress } from '@mui/material';

const Home = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch trending movies
        const moviesResponse = await api.get('/movies/trending/movies');
        // Fetch trending TV shows
        const tvShowsResponse = await api.get('/movies/trending/tv');

        // Combine and add media_type
        const combinedResults = [
          ...(Array.isArray(moviesResponse.data.results) ? moviesResponse.data.results.map(item => ({ ...item, media_type: 'movie' })) : []),
          ...(Array.isArray(tvShowsResponse.data.results) ? tvShowsResponse.data.results.map(item => ({ ...item, media_type: 'tv' })) : []),
        ];

        // Sort by popularity (optional, adjust as needed)
        combinedResults.sort((a, b) => b.popularity - a.popularity);

        setTrendingItems(combinedResults);
      } catch (err) {
        console.error('Error fetching trending content:', err);
        setError('Failed to load trending content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#ffffff', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
        Trending Now
      </Typography>
      <SearchGrid items={trendingItems} />
    </Box>
  );
};

export default Home;
