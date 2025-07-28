import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';

export default function Watchlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { data: watchlist, isLoading, error, refetch } = useQuery(
    'watchlist',
    async () => {
      try {
        console.log('Fetching watchlist...');
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          throw new Error('Authentication required');
        }
        
        const response = await axios.get('http://localhost:5000/api/watchlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Watchlist response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching watchlist:', error.response?.data || error.message);
        throw error;
      }
    },
    {
      enabled: !!user,
      retry: 2,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Query error:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load watchlist',
          severity: 'error'
        });
      }
    }
  );

  const removeFromWatchlist = async (movieId) => {
    try {
      console.log('Removing movie from watchlist:', movieId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`http://localhost:5000/api/watchlist/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Successfully removed from watchlist');
      refetch();
      setSnackbar({
        open: true,
        message: 'Removed from watchlist successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to remove from watchlist',
        severity: 'error'
      });
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please log in to view your watchlist
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Failed to load watchlist. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Your watchlist is empty. Add some movies or TV shows to get started!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Watchlist
      </Typography>
      <Grid container spacing={3}>
        {watchlist.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                alt={item.title}
                sx={{ height: 400, objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/${item.mediaType}/${item.mediaId}`)}
                >
                  View Details
                </Button>
                <Tooltip title="Remove from watchlist">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeFromWatchlist(item.mediaId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
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