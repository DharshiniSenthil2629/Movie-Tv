const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// Search endpoint
router.get('/', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Check if TMDB API key is set
        if (!process.env.TMDB_API_KEY) {
            console.error('TMDB_API_KEY is not set in environment variables');
            return res.status(500).json({ message: 'TMDB API key is not configured' });
        }

        console.log('\n=== SEARCH REQUEST ===');
        console.log('Query:', q);
        console.log('API Key:', process.env.TMDB_API_KEY ? '***' : 'NOT SET');

        // Search both movies and TV shows
        const movieUrl = `https://api.themoviedb.org/3/search/movie`;
        const tvUrl = `https://api.themoviedb.org/3/search/tv`;
        
        const movieParams = {
            api_key: process.env.TMDB_API_KEY,
            query: q,
            language: 'en-US',
            page: 1,
            include_adult: false
        };

        const tvParams = {
            api_key: process.env.TMDB_API_KEY,
            query: q,
            language: 'en-US',
            page: 1,
            include_adult: false
        };

        console.log('\nMovie Search Request:');
        console.log('URL:', movieUrl);
        console.log('Params:', { ...movieParams, api_key: '***' });

        console.log('\nTV Search Request:');
        console.log('URL:', tvUrl);
        console.log('Params:', { ...tvParams, api_key: '***' });

        const [movieResponse, tvResponse] = await Promise.all([
            axios.get(movieUrl, { 
                params: movieParams,
                timeout: 5000 // 5 second timeout
            })
            .then(response => {
                console.log('\nMovie Search Response:');
                console.log('Status:', response.status);
                console.log('Results:', response.data.results.length);
                return response;
            })
            .catch(error => {
                console.error('\nMovie Search Error:');
                console.error('Message:', error.message);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Data:', error.response.data);
                }
                return { data: { results: [] } };
            }),
            axios.get(tvUrl, { 
                params: tvParams,
                timeout: 5000 // 5 second timeout
            })
            .then(response => {
                console.log('\nTV Search Response:');
                console.log('Status:', response.status);
                console.log('Results:', response.data.results.length);
                return response;
            })
            .catch(error => {
                console.error('\nTV Search Error:');
                console.error('Message:', error.message);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Data:', error.response.data);
                }
                return { data: { results: [] } };
            })
        ]);

        // Combine and format results
        const results = [
            ...movieResponse.data.results.map(movie => ({
                ...movie,
                media_type: 'movie'
            })),
            ...tvResponse.data.results.map(tv => ({
                ...tv,
                media_type: 'tv'
            }))
        ].sort((a, b) => b.popularity - a.popularity);

        console.log('\nFinal Results:');
        console.log('Total items:', results.length);
        if (results.length > 0) {
            console.log('First result:', {
                title: results[0].title || results[0].name,
                type: results[0].media_type,
                id: results[0].id
            });
        }

        res.json(results);
    } catch (error) {
        console.error('\n=== SEARCH ERROR ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
        res.status(500).json({ 
            message: 'Error performing search',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 