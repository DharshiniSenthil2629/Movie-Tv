import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  IconButton,
  Tooltip,
  Box,
  Rating,
  Stack
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  },
  position: 'relative',
  overflow: 'hidden',
});

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '150%', // 2:3 aspect ratio
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
  }
});

const MovieTitle = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '3.5em', // Adjust based on your font size and line height
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem'
});

const MovieInfo = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: 'auto',
  paddingTop: '0.5rem'
});

const FavoriteButton = styled(IconButton)({
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  zIndex: 2
});

const RatingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  color: '#fff',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  position: 'absolute',
  bottom: '0.5rem',
  right: '0.5rem',
  zIndex: 1
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem',
  '&:last-child': {
    paddingBottom: '1rem'
  }
});

function MovieCard({ id, title, posterPath, releaseDate, voteAverage, type, onWatchlistUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Check if movie is in watchlist when component mounts or when watchlist is updated
  useEffect(() => {
    console.log('MovieCard - Component mounted/updated for movie:', id);
    
    if (!user?.userId) {
      setIsInWatchlist(false);
      return;
    }

    console.log('MovieCard - Checking watchlist for movie:', id);
    
    // Add a simple debounce to prevent rapid firing of requests
    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/api/watchlist');
        console.log('MovieCard - Watchlist data:', response.data);
        // Convert both to strings for comparison
        const inWatchlist = response.data.some(item => String(item.mediaId) === String(id));
        console.log('MovieCard - Comparing mediaId:', String(id), 'with watchlist items:', response.data.map(item => String(item.mediaId)));
        console.log('MovieCard - Is in watchlist:', inWatchlist);
        setIsInWatchlist(inWatchlist);
      } catch (error) {
        console.error('Error checking watchlist:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Handle unauthorized/forbidden (user not logged in)
          setIsInWatchlist(false);
        }
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timer);
  }, [id, user?.userId]);

  const handleCardClick = () => {
    navigate(`/movie/${type}/${id}`);
  };

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    
    // Early return if user is not logged in
    if (!user?.id) {
      navigate('/login');
      return;
    }

    // Optimistic UI update
    const wasInWatchlist = isInWatchlist;
    setIsInWatchlist(!wasInWatchlist);

    try {
      if (!wasInWatchlist) {
        console.log('MovieCard - Adding to watchlist:', { userId: user.id, movieId: id, title });
        const movieData = {
          mediaId: parseInt(id),  // Changed from movieId to mediaId
          mediaType: type,        // Changed from type to mediaType
          title,
          posterPath: posterPath, // Changed from poster_path to posterPath
        };
        console.log('MovieCard - Adding movie data:', movieData);
        await api.post('/api/watchlist', movieData);
        console.log('MovieCard - Added to watchlist');
      } else {
        console.log('MovieCard - Removing movie:', { userId: user.id, movieId: id });
        await api.delete(`/api/watchlist/${id}`);
        console.log('MovieCard - Removed from watchlist');
      }
      // Only call the update callback if the request was successful
      onWatchlistUpdate?.();
    } catch (error) {
      // Revert optimistic update on error
      setIsInWatchlist(wasInWatchlist);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      } else {
        console.error('Error updating watchlist:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  return (
    <StyledCard>
      <CardActionArea 
        onClick={handleCardClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative' }}>
          <StyledCardMedia
            component="img"
            image={
              posterPath 
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : 'https://via.placeholder.com/300x450?text=No+Poster'
            }
            alt={title}
          />
          <RatingContainer>
            <Rating 
              value={(voteAverage / 2) || 0} 
              precision={0.5} 
              size="small" 
              readOnly 
              sx={{ color: '#ffd700' }}
            />
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {voteAverage ? voteAverage.toFixed(1) : 'N/R'}
            </Typography>
          </RatingContainer>
          <Tooltip title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}>
            <FavoriteButton 
              onClick={handleWatchlistClick}
              size="small"
              color={isInWatchlist ? 'error' : 'default'}
            >
              {isInWatchlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </FavoriteButton>
          </Tooltip>
        </Box>
        
        <StyledCardContent>
          <MovieTitle variant="subtitle1" component="h3">
            {title}
          </MovieTitle>
          
          <MovieInfo>
            <Typography variant="body2" color="text.secondary">
              {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type === 'movie' ? 'Movie' : 'TV Show'}
            </Typography>
          </MovieInfo>
        </StyledCardContent>
      </CardActionArea>
    </StyledCard>
  );
}

export default MovieCard;
