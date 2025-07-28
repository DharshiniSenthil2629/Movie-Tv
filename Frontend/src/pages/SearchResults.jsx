import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import SearchGrid from '../components/SearchGrid';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const query = searchParams.get('q');
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching search results for:', query);
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        console.log('Search response:', response.data);
        
        if (!Array.isArray(response.data)) {
          console.error('Invalid response format:', response.data);
          setError('Invalid response from server');
          return;
        }

        setResults(response.data);
      } catch (err) {
        console.error('Search error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.message || 'Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CircularProgress sx={{ color: '#ffd700' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)'
          }}
        >
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  const query = searchParams.get('q');

  return (
    <Box 
      sx={{ 
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          color: '#ffffff',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold'
        }}
      >
        Search Results for "{query}"
      </Typography>
      <SearchGrid items={results} />
    </Box>
  );
};

export default SearchResults; 