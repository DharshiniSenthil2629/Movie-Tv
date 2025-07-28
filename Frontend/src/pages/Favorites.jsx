import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import { api } from '../services/api';

function Favorites() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaType, setMediaType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshWatchlist = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchWatchlist = async () => {
      if (!user?.userId) return;
      
      try {
        const response = await api.get('/api/watchlist');
        if (isMounted) {
          setWatchlist(Array.isArray(response.data) ? response.data : []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching watchlist:', err);
          setError('Failed to load your watchlist');
          setLoading(false);
        }
      }
    };

    fetchWatchlist();

    return () => {
      isMounted = false;
    };
  }, [user?.userId, refreshKey]);

  const handleTabChange = (event, newValue) => {
    setMediaType(newValue);
  };

  const filteredWatchlist = mediaType === 'all'
    ? watchlist
    : watchlist.filter(item => item.mediaType === mediaType);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          p: 4,
          mb: 4
        }}
      >
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
        Your Watchlist
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          textColor="primary"
          indicatorColor="primary"
          value={mediaType}
          onChange={handleTabChange}
          aria-label="media type tabs"
        >
          <Tab label="All" value="all" />
          <Tab label="Movies" value="movie" />
          <Tab label="TV Shows" value="tv" />
        </Tabs>
      </Box>

      {filteredWatchlist.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your watchlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start adding movies and TV shows to your watchlist!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredWatchlist.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.mediaId}>
              <MovieCard
                id={item.mediaId}
                title={item.title}
                posterPath={item.posterPath}
                type={item.mediaType}
                onWatchlistUpdate={refreshWatchlist}
              />
            </Grid>
          ))}
        </Grid>
      )}
      </Box>
    </Container>
  );
}

export default Favorites;
