const express = require('express');
const bookingRoutes = require('./routes/booking.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/bookings', bookingRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
