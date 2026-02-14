const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity (or configure efficiently)
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ✅ FIXED DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected');

        // Seed Users
        const authController = require('./src/controllers/authController');
        await authController.seedUsers();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', apiRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // Join a room based on tracking ID
    socket.on('join-tracking', (trackingId) => {
        socket.join(trackingId);
        console.log(`User ${socket.id} joined tracking room: ${trackingId}`);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
