import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Rating,
  Chip,
  IconButton,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export default function TVShowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/movies/tv/${id}`);
        setShow(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load TV show details. Please try again later.');
        console.error('Error fetching TV show details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  const handleAddToWatchlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToWatchlist({
      id: show.id,
      title: show.name,
      poster_path: show.poster_path,
      type: 'tv',
      overview: show.overview,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date
    });
  };

  const handleRemoveFromWatchlist = () => {
    removeFromWatchlist(show.id);
  };

  const isInWatchlist = watchlist.some(item => item.id === show?.id);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!show) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {show.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating value={show.vote_average / 2} precision={0.5} readOnly />
            <Typography variant="body1" color="text.secondary">
              ({show.vote_count} votes)
            </Typography>
            {user && (
              <IconButton
                onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
                color="primary"
              >
                {isInWatchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              First Air Date: {new Date(show.first_air_date).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Status: {show.status}
            </Typography>
            {show.number_of_seasons && (
              <Typography variant="subtitle1" gutterBottom>
                Number of Seasons: {show.number_of_seasons}
              </Typography>
            )}
            {show.number_of_episodes && (
              <Typography variant="subtitle1" gutterBottom>
                Number of Episodes: {show.number_of_episodes}
              </Typography>
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {show.overview}
          </Typography>

          {show.genres && show.genres.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Genres
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {show.genres.map((genre) => (
                  <Chip key={genre.id} label={genre.name} />
                ))}
              </Box>
            </Box>
          )}

          {show.created_by && show.created_by.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Created By
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {show.created_by.map((creator) => (
                  <Chip key={creator.id} label={creator.name} />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Back to TV Shows
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} 