const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user's watchlist
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching watchlist for user:', req.user);
        console.log('User ID:', req.user.id);
        const user = await User.findById(req.user.id).select('watchlist');
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Watchlist fetched:', user.watchlist);
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Error fetching watchlist' });
    }
});

// Check if item is in watchlist
router.get('/check/:mediaId', auth, async (req, res) => {
    try {
        const { mediaId } = req.params;
        console.log('Checking watchlist status for mediaId:', mediaId);
        
        const user = await User.findById(req.user.id).select('watchlist');
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        const isInWatchlist = user.watchlist.some(item => item.mediaId === mediaId);
        console.log('Is in watchlist:', isInWatchlist);
        
        res.json({ isInWatchlist });
    } catch (error) {
        console.error('Error checking watchlist status:', error);
        res.status(500).json({ message: 'Error checking watchlist status' });
    }
});

// Add item to watchlist
router.post('/', auth, async (req, res) => {
    try {
        const { mediaId, mediaType, title, posterPath } = req.body;
        console.log('Adding to watchlist - Request body:', req.body);
        console.log('User from auth:', req.user);
        
        if (!mediaId || !mediaType || !title) {
            console.log('Missing required fields:', { mediaId, mediaType, title });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if item already exists in watchlist
        const exists = user.watchlist.some(item => 
            item.mediaId === mediaId && item.mediaType === mediaType
        );

        if (exists) {
            console.log('Item already exists in watchlist');
            return res.status(400).json({ message: 'Item already in watchlist' });
        }

        const newItem = {
            mediaId,
            mediaType,
            title,
            posterPath,
            addedAt: new Date()
        };
        console.log('Adding new item to watchlist:', newItem);

        user.watchlist.push(newItem);
        await user.save();
        console.log('Item added to watchlist successfully. Updated watchlist:', user.watchlist);
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Error adding to watchlist' });
    }
});

// Remove item from watchlist
router.delete('/:mediaId', auth, async (req, res) => {
    try {
        const { mediaId } = req.params;
        console.log('Removing from watchlist:', mediaId);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.watchlist = user.watchlist.filter(item => item.mediaId !== mediaId);
        await user.save();
        
        console.log('Item removed from watchlist successfully');
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: 'Error removing from watchlist' });
    }
});

module.exports = router; 