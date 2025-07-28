import React from 'react';
import ContentGrid from '../components/ContentGrid';
import '../css/ContentPage.css';

const Movies = () => {
  return (
    <div className="content-page">
      <h1>Popular Movies</h1>
      <ContentGrid fetchUrl={`${import.meta.env.VITE_API_URL}/api/movies/popular/movies`} mediaType="movie" />
    </div>
  );
};

export default Movies; 