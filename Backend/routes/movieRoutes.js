const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get Movie/TV Show Details
router.get('/details/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'videos,credits',
                language: 'en-US'
            },
            timeout: 10000,
            headers: {
                'Accept-Encoding': 'gzip',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching details:', error.message);
        res.status(500).json({ 
            message: 'Error fetching details', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get Trending Movies/TV Shows with pagination
router.get('/trending/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const page = parseInt(req.query.page) || 1;
        
        // Reduce the number of parallel requests to avoid rate limiting
        const pagesToFetch = 2;
        const results = [];
        
        // Add delay between requests
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        for (let i = 0; i < pagesToFetch; i++) {
            try {
                // Add a small delay between requests
                if (i > 0) {
                    await delay(1000); // 1 second delay between requests
                }
                
                const response = await axios.get(`https://api.themoviedb.org/3/trending/${type}/week`, {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: page + i,
                        language: 'en-US',
                        region: 'US'
                    },
                    timeout: 10000, // 10 seconds timeout
                    headers: {
                        'Accept-Encoding': 'gzip',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                if (response.data && response.data.results) {
                    results.push(...response.data.results);
                }
            } catch (error) {
                console.error(`Error fetching page ${page + i}:`, error.message);
                // Continue with the next page even if one fails
                continue;
            }
        }
        
        // Remove duplicates from results
        const uniqueResults = [];
        const seenIds = new Set();
        
        results.forEach(item => {
            if (item && item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueResults.push(item);
            }
        });
        
        if (uniqueResults.length === 0) {
            console.error('No results found from TMDB API');
            return res.status(200).json({ 
                message: 'No results found',
                results: []
            });
        }
        
        res.json(uniqueResults);
    } catch (error) {
        console.error('Error in trending endpoint:', error);
        res.status(500).json({ 
            message: 'Error fetching trending content', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Search Movies/TV Shows with pagination
router.get('/search', async (req, res) => {
    try {
        const { query, type, page = 1 } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        const pagesToFetch = 2; // Reduced from 3 to 2 pages
        const results = [];
        
        // Add delay between requests
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        for (let i = 0; i < pagesToFetch; i++) {
            try {
                // Add a small delay between requests
                if (i > 0) {
                    await delay(1000);
                }
                
                const response = await axios.get(`https://api.themoviedb.org/3/search/${type || 'multi'}`, {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        query: query,
                        page: parseInt(page) + i,
                        language: 'en-US',
                        include_adult: false
                    },
                    timeout: 10000,
                    headers: {
                        'Accept-Encoding': 'gzip',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                if (response.data && response.data.results) {
                    results.push(...response.data.results);
                }
            } catch (error) {
                console.error(`Error fetching search page ${i + 1}:`, error.message);
                continue;
            }
        }
        
        // Remove duplicates
        const uniqueResults = [];
        const seenIds = new Set();
        
        results.forEach(item => {
            if (item && item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueResults.push(item);
            }
        });
        
        res.json(uniqueResults);
    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({ 
            message: 'Error performing search', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get Popular Movies
router.get('/popular/movies', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                page: page,
                language: 'en-US',
                region: 'US'
            },
            timeout: 10000,
            headers: {
                'Accept-Encoding': 'gzip',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular movies:', error.message);
        res.status(500).json({ 
            message: 'Error fetching popular movies', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get Popular TV Shows
router.get('/tv/popular', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`https://api.themoviedb.org/3/tv/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                page: page,
                language: 'en-US'
            },
            timeout: 10000,
            headers: {
                'Accept-Encoding': 'gzip',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular TV shows:', error.message);
        res.status(500).json({ 
            message: 'Error fetching popular TV shows', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get TV Show Details
router.get('/tv/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'videos,credits',
                language: 'en-US'
            },
            timeout: 10000,
            headers: {
                'Accept-Encoding': 'gzip',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching TV show details:', error.message);
        res.status(500).json({ 
            message: 'Error fetching TV show details', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Watchlist Routes
router.get('/watchlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.watchlist || []);
    } catch (error) {
        console.error('Error fetching watchlist:', error.message);
        res.status(500).json({ 
            message: 'Error fetching watchlist', 
            error: error.message 
        });
    }
});

router.post('/watchlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { id, title, poster_path, type, overview, vote_average, first_air_date, release_date } = req.body;
        
        // Check if item already exists in watchlist
        const existingItem = user.watchlist.find(item => item.id === id);
        if (existingItem) {
            return res.status(400).json({ message: 'Item already in watchlist' });
        }

        user.watchlist.push({
            id,
            title,
            poster_path,
            type,
            overview,
            vote_average,
            first_air_date,
            release_date,
            addedAt: new Date()
        });

        await user.save();
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error adding to watchlist:', error.message);
        res.status(500).json({ 
            message: 'Error adding to watchlist', 
            error: error.message 
        });
    }
});

router.delete('/watchlist/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.watchlist = user.watchlist.filter(item => item.id !== req.params.id);
        await user.save();
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error removing from watchlist:', error.message);
        res.status(500).json({ 
            message: 'Error removing from watchlist', 
            error: error.message 
        });
    }
});

module.exports = router;
