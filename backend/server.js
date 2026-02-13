const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


// Middleware
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        return callback(null, true); // Reflect origin to allow all
    },
    credentials: true
}));


app.use(express.json());


// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// Database Coonection
mongoose.connect('mongodb://localhost:27017/courier_app')
    .then(async () => {
        console.log('MongoDB Connected');
        // Seed Users
        const authController = require('./src/controllers/authController');
        await authController.seedUsers();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Restart Trigger 1

