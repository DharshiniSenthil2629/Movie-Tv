const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'TMDB_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Routes
const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
    try {
        console.log('\n=== ATTEMPTING MONGODB CONNECTION ===');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? '***' : 'NOT SET');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4, skip trying IPv6
        };
        
        console.log('Connection options:', JSON.stringify(options, null, 2));
        
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('✅ MongoDB connected successfully');
        console.log('MongoDB host:', mongoose.connection.host);
        console.log('MongoDB database:', mongoose.connection.name);
        
    } catch (err) {
        console.error('\n❌ MONGODB CONNECTION ERROR:', err.message);
        console.error('Error details:', {
            name: err.name,
            code: err.code,
            codeName: err.codeName,
            errorLabels: err.errorLabels,
            stack: err.stack
        });
        
        console.log('\nRetrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Start the MongoDB connection
connectWithRetry();

// Event listeners for MongoDB connection
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// TMDB API proxy route
app.get('/api/tmdb/search', async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }
        
        const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                language: 'en-US',
                page: 1,
                include_adult: false
            },
            timeout: 5000 // 5 second timeout
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('TMDB API error:', error.message);
        next(error);
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', {
        message: err.message,
        stack: err.stack,
        name: err.name
    });
    
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && {
            stack: err.stack,
            error: err.toString()
        })
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider restarting the server or handling the error appropriately
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Consider restarting the server or handling the error appropriately
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? '***' : 'NOT SET'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'NOT SET'}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});
