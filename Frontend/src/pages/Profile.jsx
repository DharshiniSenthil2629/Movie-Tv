import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/ContentPage.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setWatchlist(response.data.watchlist || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const removeFromWatchlist = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/watchlist/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWatchlist(watchlist.filter(item => item.movieId !== movieId));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError('Failed to remove from watchlist');
    }
  };

  if (loading) {
    return <div className="content-page">Loading profile...</div>;
  }

  if (error) {
    return <div className="content-page error">{error}</div>;
  }

  if (!user) {
    return <div className="content-page no-results">User data not available.</div>;
  }

  return (
    <div className="content-page">
      <h1>Profile</h1>
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="watchlist-section">
        <h2>My Watchlist</h2>
        {watchlist.length === 0 ? (
          <p>Your watchlist is empty. Start adding movies and TV shows!</p>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((item) => (
              <div key={item.movieId} className="watchlist-item">
                <Link to={`/movie/${item.movieId}`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={item.title}
                    className="watchlist-poster"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                  />
                  <div className="watchlist-title">{item.title}</div>
                </Link>
                <button
                  className="remove-button"
                  onClick={() => removeFromWatchlist(item.movieId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
