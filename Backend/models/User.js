const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot be longer than 30 characters'],
        match: [/^[a-zA-Z0-9_\s\-.]*$/, 'Username can only contain letters, numbers, spaces, hyphens, periods, and underscores']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    watchlist: [{
        mediaId: {
            type: Number,
            required: true
        },
        mediaType: {
            type: String,
            enum: ['movie', 'tv'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        posterPath: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    joinDate: { type: Date, default: Date.now },
    preferences: {
        genres: { type: [String], default: [] },
        ratings: { type: [Number], default: [] }
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        movieId: { type: Number, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', UserSchema);