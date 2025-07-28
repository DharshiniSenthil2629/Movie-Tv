import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const WatchlistContext = createContext();

export function useWatchlist() {
  return useContext(WatchlistContext);
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/watchlist`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const addToWatchlist = async (item) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/watchlist`,
        item,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      setWatchlist(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (itemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/watchlist/${itemId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
} 