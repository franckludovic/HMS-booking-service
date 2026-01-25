const { PrismaClient } = require('@prisma/client');
const { calculateEndTime, checkOverlap } = require('../utils/time');
const { isTransitionAllowed } = require('../utils/lifecycle');
const redisClient = require('../config/redis');
const axios = require('axios');

const prisma = new PrismaClient();

const getBookings = async (userId, { limit = 10, offset = 0, role, status }) => {
  const where = {};
  if (role === 'client') {
    where.clientId = userId;
  } else if (role === 'worker') {
    where.workerId = userId;
  }
  if (status) {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.booking.count({ where });

  return { items: bookings, total };
};

const createBooking = async (bookingData) => {
  const { clientId, workerId, scheduledAt, durationMinutes, serviceType, location, notes } = bookingData;

  // Check for overlapping bookings
  const endTime = calculateEndTime(scheduledAt, durationMinutes);
  const overlap = await checkOverlap(workerId, scheduledAt, endTime);
  if (overlap) {
    throw new Error('Worker is not available at the requested time');
  }

  const booking = await prisma.booking.create({
    data: {
      clientId,
      workerId,
      scheduledAt,
      durationMinutes,
      serviceType,
      location,
      notes,
    },
  });

  // Create event
  await prisma.bookingEvent.create({
    data: {
      eventType: 'BookingRequested',
      bookingId: booking.id,
    },
  });

  // Emit domain event
  try {
    await axios.post('http://localhost:3000/internal/events', {
      eventType: 'booking.created',
      timestamp: new Date().toISOString(),
      data: {
        bookingId: booking.id,
        clientId,
        workerId,
        scheduledAt,
        serviceCategory: serviceType, // Assuming serviceType maps to category
        serviceType,
        durationMinutes
      }
    });
  } catch (error) {
    console.error('Failed to emit booking.created event:', error.message);
    // Don't fail the booking creation if event emission fails
  }

  return booking;
};

const validateBooking = async ({ workerId, scheduledAt, durationMinutes }) => {
  const endTime = calculateEndTime(scheduledAt, durationMinutes);
  const overlap = await checkOverlap(workerId, scheduledAt, endTime);
  return { available: !overlap, reason: overlap ? 'Worker unavailable' : null };
};

const getBooking = async (bookingId) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
  });
};

const updateBookingStatus = async (bookingId, { status, cancellationReason }, user) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!isTransitionAllowed(booking.status, status)) {
    throw new Error('Invalid status transition');
  }

  // Authorization check
  if (status === 'cancelled_by_client' && booking.clientId !== user.id) {
    throw new Error('Unauthorized');
  }
  if (status === 'cancelled_by_worker' && booking.workerId !== user.id) {
    throw new Error('Unauthorized');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status, cancellationReason },
  });

  // Create event
  let eventType;
  switch (status) {
    case 'pending_approval':
      eventType = 'BookingPendingApproval';
      break;
    case 'accepted':
      eventType = 'BookingAccepted';
      break;
    case 'in_progress':
      eventType = 'BookingInProgress';
      break;
    case 'completed':
      eventType = 'BookingCompleted';
      break;
    case 'cancelled_by_client':
      eventType = 'BookingCancelledByClient';
      break;
    case 'cancelled_by_worker':
      eventType = 'BookingCancelledByWorker';
      break;
    default:
      eventType = 'BookingRequested'; // fallback
  }
  await prisma.bookingEvent.create({
    data: {
      eventType,
      bookingId,
    },
  });

  return updatedBooking;
};

const getBookingEvents = async () => {
  return await prisma.bookingEvent.findMany({
    orderBy: { timestamp: 'desc' },
  });
};

module.exports = {
  getBookings,
  createBooking,
  validateBooking,
  getBooking,
  updateBookingStatus,
  getBookingEvents,
};
