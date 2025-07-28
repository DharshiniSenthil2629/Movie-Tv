import React from 'react';
import ContentGrid from '../components/ContentGrid';
import '../css/ContentPage.css';

const TV = () => {
  return (
    <div className="content-page">
      <h1>Popular TV Shows</h1>
      <ContentGrid fetchUrl="http://localhost:5000/api/movies/popular/tv" mediaType="tv" />
    </div>
  );
};

export default TV; 