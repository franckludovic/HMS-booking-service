const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const createBookingSchema = require('../validators/createBooking.schema');
const updateBookingStatusSchema = require('../validators/updateBookingStatus.schema');

router.get('/bookings', authMiddleware, bookingController.getBookings);
router.post('/bookings', authMiddleware, validateMiddleware(createBookingSchema), bookingController.createBooking);
router.post('/bookings/validate', authMiddleware, bookingController.validateBooking);
router.get('/bookings/:bookingId', authMiddleware, bookingController.getBooking);
router.patch('/bookings/:bookingId/status', authMiddleware, validateMiddleware(updateBookingStatusSchema), bookingController.updateBookingStatus);
router.get('/bookings/events', authMiddleware, bookingController.getBookingEvents);

module.exports = router;
