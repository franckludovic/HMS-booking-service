const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const createBookingSchema = require('../validators/createBooking.schema');
const updateBookingStatusSchema = require('../validators/updateBookingStatus.schema');
const validateBookingSchema = require('../validators/validateBooking.schema');

router.get('/', authMiddleware, bookingController.getBookings);
router.post('/', authMiddleware, validateRequest(createBookingSchema), bookingController.createBooking);
router.post('/validate', authMiddleware, validateRequest(validateBookingSchema), bookingController.validateBooking);
router.get('/:bookingId', authMiddleware, bookingController.getBooking);
router.patch('/:bookingId/status', authMiddleware, validateRequest(updateBookingStatusSchema), bookingController.updateBookingStatus);
router.get('/events', authMiddleware, bookingController.getBookingEvents);

module.exports = router;
