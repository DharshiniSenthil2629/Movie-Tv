const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test endpoint to verify server and database status
router.get('/test', (req, res) => {
    try {
        console.log('\n=== TEST ENDPOINT HIT ===');
        
        // Log basic info
        console.log('Server time:', new Date().toISOString());
        console.log('Node version:', process.version);
        console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
        
        // MongoDB connection status
        const mongoStatus = mongoose.connection.readyState;
        const mongoStatusText = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }[mongoStatus] || 'unknown';
        
        console.log('MongoDB status:', mongoStatus, `(${mongoStatusText})`);
        console.log('MongoDB models:', mongoose.modelNames());
        
        // Check if User model is loaded
        const userModelExists = !!mongoose.models.User;
        console.log('User model loaded:', userModelExists);
        
        // Prepare response
        const response = {
            status: 'success',
            server: 'running',
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: mongoStatusText,
                connected: mongoStatus === 1,
                models: mongoose.modelNames(),
                userModelLoaded: userModelExists
            }
        };
        
        // If User model is loaded, add its schema paths
        if (userModelExists) {
            response.database.userModelPaths = 
                Object.keys(mongoose.models.User.schema.paths);
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('\n❌ TEST ENDPOINT ERROR:', error);
        
        res.status(500).json({
            status: 'error',
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                stack: error.stack,
                code: error.code
            } : undefined
        });
    }
});

const auth = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
    try {
        console.log('\n=== NEW REGISTRATION ATTEMPT ===');
        console.log('Request headers:', JSON.stringify(req.headers, null, 2));
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        // Log MongoDB connection state
        console.log('\n--- Database Info ---');
        console.log('Mongoose connection state:', mongoose.connection.readyState);
        console.log('Mongoose models:', mongoose.modelNames());
        console.log('User model exists:', !!mongoose.models.User);
        
        // Check if required fields are present
        if (!req.body.username || !req.body.email || !req.body.password) {
            const missing = [
                !req.body.username ? 'username' : null,
                !req.body.email ? 'email' : null,
                !req.body.password ? 'password' : null
            ].filter(Boolean);
            
            console.error('❌ Missing required fields:', missing);
            return res.status(400).json({ 
                message: 'Missing required fields',
                missing: missing,
                type: 'validation_error',
                received: {
                    username: !!req.body.username,
                    email: !!req.body.email,
                    password: !!req.body.password
                }
            });
        }
        
        console.log('\n--- Processing Registration ---');
        console.log('Checking for existing user...');
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });
        
        if (existingUser) {
            const conflictField = existingUser.email === req.body.email ? 'email' : 'username';
            console.error(`❌ User with this ${conflictField} already exists`);
            return res.status(400).json({
                message: `${conflictField} already in use`,
                field: conflictField,
                type: 'duplicate_key'
            });
        }
        
        console.log('Creating new user...');
        
        // Create new user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        
        console.log('User object before save:', JSON.stringify(user, null, 2));
        
        // Save user to database
        const savedUser = await user.save();
        console.log('✅ User saved successfully');
        
        // Create token
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('✅ Token generated');
        
        // Send response
        res.status(201).json({
            message: 'User registered successfully',
            token,
            userId: savedUser._id,
            username: savedUser.username
        });
        
    } catch (error) {
        console.error('\n⚠️ REGISTRATION ERROR DETAILS:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            const errors = {};
            
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors,
                type: 'validation_error'
            });
        }
        
        if (error.name === 'MongoServerError' && error.code === 11000) {
            console.error('Duplicate key error:', error.keyValue);
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} already in use`,
                field: field,
                type: 'duplicate_key',
                error: error.message
            });
        }
        
        // For any other errors
        console.error('Unexpected error during registration:', {
            error: error,
            body: req.body,
            headers: req.headers
        });
        
        res.status(500).json({
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            type: 'server_error'
        });
    }
    console.log('=== NEW REGISTRATION ATTEMPT ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET ? '***' : 'NOT SET',
        MONGODB_URI: process.env.MONGODB_URI ? '***' : 'NOT SET'
    });
    
    // Log MongoDB connection state
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    console.log('Mongoose models:', mongoose.modelNames());
    console.log('=== NEW REGISTRATION ATTEMPT ===');
    console.log('Registration request received:', {
        username: req.body.username,
        email: req.body.email,
        passwordLength: req.body.password ? req.body.password.length : 'missing',
        headers: req.headers
    });

    // Validate required fields first
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        const error = new Error('Missing required fields');
        console.error('Validation error:', { username, email, hasPassword: !!password });
        return res.status(400).json({ 
            message: 'Missing required fields',
            required: ['username', 'email', 'password'],
            received: { username: !!username, email: !!email, password: !!password }
        });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: 'Invalid email format',
            field: 'email'
        });
    }

    try {
        console.log('Checking for existing user with email:', email);
        // Check if user already exists
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ 
                message: 'An account with this email already exists',
                field: 'email'
            });
        }

        console.log('Hashing password...');
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log('Creating new user...');
        // Create new user
        const newUser = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        console.log('Saving user to database...');
        const savedUser = await newUser.save();
        console.log('User saved successfully with ID:', savedUser._id);

        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            const error = new Error('JWT_SECRET is not configured');
            console.error('Configuration error:', error.message);
            throw error;
        }

        console.log('Creating JWT token...');
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Registration successful for user:', savedUser._id);
        return res.status(201).json({ 
            token, 
            userId: savedUser._id,
            message: 'Registration successful',
            username: savedUser.username
        });
    } catch (error) {
        // Log the full error for debugging
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = {};
            Object.keys(error.errors).forEach(key => {
                messages[key] = error.errors[key].message;
            });
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        // Handle duplicate key error (email or username already exists)
        if (error.code === 11000) {
            const field = error.message.includes('email') ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `This ${field} is already registered`,
                field: field
            });
        }
        
        // Default error response
        const errorResponse = {
            success: false,
            message: 'An error occurred during registration. Please try again.'
        };

        // Include more details in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.error = error.message;
            errorResponse.stack = error.stack;
        }

        res.status(500).json(errorResponse);
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check if movie is in watchlist
router.get('/watchlist/check/:movieId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isInWatchlist = user.watchlist.some(item => 
            item.movieId === parseInt(req.params.movieId) && item.status === 'active'
        );

        res.json({ isInWatchlist });
    } catch (error) {
        console.error('Error checking watchlist:', error);
        res.status(500).json({ message: 'Error checking watchlist status' });
    }
});

// Add to watchlist
router.post('/watchlist', auth, async (req, res) => {
    try {
        const { movieId, title, poster_path, type } = req.body;
        
        if (!movieId || !title || !poster_path) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if movie is already in watchlist
        const existingItem = user.watchlist.find(item => 
            item.movieId === movieId && item.status === 'active'
        );

        if (existingItem) {
            return res.status(400).json({ message: 'Movie is already in watchlist' });
        }

        // Add to watchlist
        user.watchlist.push({
            movieId,
            title,
            poster_path,
            type,
            addedAt: new Date(),
            status: 'active'
        });

        await user.save();
        res.json({ message: 'Added to watchlist successfully' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Error adding to watchlist' });
    }
});

// Remove from watchlist
router.delete('/watchlist/:movieId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const movieId = parseInt(req.params.movieId);
        const watchlistItem = user.watchlist.find(item => 
            item.movieId === movieId && item.status === 'active'
        );

        if (!watchlistItem) {
            return res.status(404).json({ message: 'Movie not found in watchlist' });
        }

        // Mark as removed instead of actually removing
        watchlistItem.status = 'removed';
        await user.save();

        res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: 'Error removing from watchlist' });
    }
});

// Get user's watchlist
router.get('/watchlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only return active items
        const activeWatchlist = user.watchlist.filter(item => item.status === 'active');
        res.json(activeWatchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Error fetching watchlist' });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Verify token endpoint
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Error verifying token' });
    }
});

module.exports = router;
