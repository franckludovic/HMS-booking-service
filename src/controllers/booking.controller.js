const bookingService = require('../services/booking.service');

const getBookings = async (req, res, next) => {
  try {
    const { limit, offset, role, status } = req.query;
    const bookings = await bookingService.getBookings(req.user.id, { limit, offset, role, status });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const validateBooking = async (req, res, next) => {
  try {
    const result = await bookingService.validateBooking(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBooking(bookingId);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, req.body, req.user);
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

const getBookingEvents = async (req, res, next) => {
  try {
    const events = await bookingService.getBookingEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  createBooking,
  validateBooking,
  getBooking,
  updateBookingStatus,
  getBookingEvents
};
