import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Box,
  Chip,
  Rating,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function MovieDetails({ type }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { data: details, isLoading, isError, error } = useQuery(['details', type, id], async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/movies/details/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('Failed to load movie details. Please try again later.');
    }
  }, {
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user) return;
      
      try {
        setIsInWatchlist(false);
      } catch (error) {
        console.error('Error checking watchlist status:', error);
        setIsInWatchlist(false);
      }
    };

    checkWatchlistStatus();
  }, [id, user]);

  const addToWatchlist = async () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to add to watchlist', severity: 'warning' });
      return;
    }
    
    try {
      setIsInWatchlist(true);
      setSnackbar({ 
        open: true, 
        message: 'Watchlist functionality coming soon!', 
        severity: 'info' 
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      setSnackbar({ 
        open: true, 
        message: 'Watchlist functionality is currently unavailable', 
        severity: 'error' 
      });
    }
  };

  const removeFromWatchlist = async () => {
    try {
      setIsInWatchlist(false);
      setSnackbar({ 
        open: true, 
        message: 'Removed from watchlist (demo)', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update watchlist', 
        severity: 'error' 
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading movie details
        </Typography>
        <Typography color="textSecondary" paragraph>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!details) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          No details found for this movie/show.
        </Alert>
      </Container>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const rating = details.vote_average / 2; // Convert to 5-star rating

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              image={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
              }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Release Date: {new Date(releaseDate).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
              <Rating value={rating} precision={0.5} readOnly />
              <Typography>({details.vote_count} votes)</Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            {details.genres?.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          <Typography variant="body1" paragraph>
            {details.overview}
          </Typography>
          {user && (
            <Button
              variant="contained"
              color={isInWatchlist ? "secondary" : "primary"}
              onClick={isInWatchlist ? removeFromWatchlist : addToWatchlist}
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </Button>
          )}
          {details.videos?.results?.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Trailer
              </Typography>
              <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${details.videos.results[0].key}`}
                  title="Trailer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
