import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Chip } from '@mui/material';
import '../css/ContentGrid.css';

const SearchGrid = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="text.secondary">
          No results found
        </Typography>
      </Box>
    );
  }

  // Separate movies and TV shows
  const movies = items.filter(item => item.media_type === 'movie');
  const tvShows = items.filter(item => item.media_type === 'tv');

  return (
    <Box>
      {movies.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 'bold' }}>
            Movies
          </Typography>
          <div className="content-grid movies">
            {movies.map((item) => (
              <Link 
                to={`/${item.media_type}/${item.id}`} 
                key={`${item.media_type}-${item.id}`} 
                className="content-item"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="content-poster"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
                <div className="content-info">
                  <div className="content-title">{item.title}</div>
                  <Chip
                    label="Movie"
                    size="small"
                    className="content-type"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                  {item.vote_average && (
                    <div className="content-rating">
                      {item.vote_average.toFixed(1)}/10
                    </div>
                  )}
                  {item.release_date && (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
                      {new Date(item.release_date).getFullYear()}
                    </Typography>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Box>
      )}

      {tvShows.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 'bold' }}>
            TV Shows
          </Typography>
          <div className="content-grid tv-shows">
            {tvShows.map((item) => (
              <Link 
                to={`/${item.media_type}/${item.id}`} 
                key={`${item.media_type}-${item.id}`} 
                className="content-item"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.name}
                  className="content-poster"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
                <div className="content-info">
                  <div className="content-title">{item.name}</div>
                  <Chip
                    label="TV Show"
                    size="small"
                    className="content-type"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                  {item.vote_average && (
                    <div className="content-rating">
                      {item.vote_average.toFixed(1)}/10
                    </div>
                  )}
                  {item.first_air_date && (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
                      {new Date(item.first_air_date).getFullYear()}
                    </Typography>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Box>
      )}
    </Box>
  );
};

export default SearchGrid; 