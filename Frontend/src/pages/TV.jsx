import React from 'react';
import ContentGrid from '../components/ContentGrid';
import '../css/ContentPage.css';

const TV = () => {
  return (
    <div className="content-page">
      <h1>Popular TV Shows</h1>
      <ContentGrid fetchUrl={`${import.meta.env.VITE_API_URL}/api/movies/popular/tv`} mediaType="tv" />
    </div>
  );
};

export default TV; 