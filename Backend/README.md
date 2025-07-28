# Movie/TV Show Database Backend

## Setup Instructions

1. Install dependencies
```bash
npm install
```

2. Create a `.env` file with the following variables:
- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: Backend server port (default: 5000)
- `TMDB_API_KEY`: Your The Movie Database (TMDB) API key
- `JWT_SECRET`: A secret key for JWT authentication

3. Run the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### User Authentication
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: User login

### Watchlist
- `POST /api/users/watchlist`: Add movie/show to watchlist
- `GET /api/users/watchlist/:userId`: Get user's watchlist
- `DELETE /api/users/watchlist`: Remove movie/show from watchlist

### Movies/TV Shows
- `GET /api/movies/details/:type/:id`: Get detailed information
- `GET /api/movies/trending/:type`: Get trending movies/shows
- `GET /api/movies/search`: Search movies/shows

## Technologies
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- TMDB API Integration
