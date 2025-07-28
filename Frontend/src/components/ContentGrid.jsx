import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../css/ContentGrid.css';

const ContentGrid = ({ fetchUrl, mediaType }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(fetchUrl);
      if (response.data && Array.isArray(response.data)) {
        setItems(response.data);
      } else if (response.data && response.data.results) {
        setItems(response.data.results);
      } else {
        setItems([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.response?.data?.message || 'Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="200px" 
        textAlign="center"
        p={3}
      >
        <ErrorOutlineIcon color="error" style={{ fontSize: 48, marginBottom: '16px' }} />
        <Typography variant="h6" color="error" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchItems}
          startIcon={<ErrorOutlineIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="200px"
        p={3}
      >
        <Typography variant="h6" color="textSecondary">
          No content found.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchItems}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <div className={`content-grid ${mediaType === 'movie' ? 'movies' : 'tv-shows'}`}>
      {items.map((item) => (
        <Link to={`/${mediaType}/${item.id}`} key={item.id} className="content-item">
          <img
            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
            alt={item.title || item.name}
            className="content-poster"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
          <div className="content-title">{item.title || item.name}</div>
        </Link>
      ))}
    </div>
  );
};

export default ContentGrid; 