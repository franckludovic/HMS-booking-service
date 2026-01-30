const prisma = require('../database/prismaClient');
const RedisCache = require('../utils/redisCache');
const RedisLock = require('../utils/redisLock');
const { isValidTransition, canUserUpdateStatus } = require('../utils/lifecycle');
const axios = require('axios');
const config = require('../config/config');
const redisClient = require('../config/redis');

const cache = new RedisCache(redisClient, 300);
const lock = new RedisLock(redisClient);

class BookingService {
  static async getBookings(userId, { limit = 10, offset = 0, role, status }) {
    const cacheKey = `bookings:${userId}:${limit}:${offset}:${role}:${status}`;

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build where clause
    const where = {};
    if (role === 'client') {
      where.clientId = userId;
    } else if (role === 'worker') {
      where.workerId = userId;
    } else {
      // If no role specified, get all bookings where user is client or worker
      where.OR = [
        { clientId: userId },
        { workerId: userId }
      ];
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 5 // Last 5 events
        }
      }
    });

    // Cache the result
    await cache.set(cacheKey, bookings);

    return bookings;
  }

  static async createBooking(bookingData, authHeader) {
    const { clientId, workerId, slotId, scheduledAt, serviceType, location, notes } = bookingData;

    // Use distributed lock to prevent race conditions
    const lockKey = `booking:slot:${slotId}`;
    const lockAcquired = await lock.acquire(lockKey, 30000); // 30 seconds

    if (!lockAcquired) {
      throw new Error('Unable to process booking due to high demand. Please try again.');
    }

    try {
      // Check if worker offers the service
      const workerResponse = await axios.get(`${config.workerProfileServiceUrl}/profile/workers/${workerId}`, {
        headers: { authorization: authHeader }
      });
      const worker = workerResponse.data;

      // Check if worker has the service in their categories
      const hasService = worker.categories?.some(cat => cat.category.name.toLowerCase() === serviceType.toLowerCase());
      if (!hasService) {
        throw new Error('Worker does not offer this service');
      }

      // Get slot details to validate scheduledAt is within slot time range
      const slotDetailsResponse = await axios.get(`${config.availabilityServiceUrl}/availability/slots/${slotId}`, {
        headers: { authorization: authHeader }
      });
      const slot = slotDetailsResponse.data;

      // Validate scheduledAt falls within slot's time range
      const scheduledTime = new Date(scheduledAt);
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      if (scheduledTime < slotStart || scheduledTime >= slotEnd) {
        throw new Error('Scheduled time must fall within the selected slot\'s time range');
      }

      // Reserve the slot
      await axios.post(`${config.availabilityServiceUrl}/availability/slots/${slotId}/reserve`, {}, {
        headers: { authorization: authHeader }
      });

      let booking;
      try {
        // Create booking
        booking = await prisma.booking.create({
          data: {
            clientId,
            workerId,
            slotId,
            scheduledAt: new Date(scheduledAt),
            serviceType,
            location,
            notes,
            status: 'requested'
          }
        });

        // Create initial event
        await prisma.bookingEvent.create({
          data: {
            eventType: 'BookingRequested',
            bookingId: booking.id
          }
        });

        return booking;
      } catch (error) {
        // If booking creation fails, release the slot
        try {
          await axios.post(`${config.availabilityServiceUrl}/availability/slots/${slotId}/release`, {}, {
            headers: { authorization: authHeader }
          });
        } catch (releaseError) {
          console.error('Failed to release slot after booking error:', releaseError.message);
        }
        throw error; // Re-throw the original error
      }
    } finally {
      // Always release the lock
      await lock.release(lockKey);
    }
  }

  static async validateBooking({ workerId, scheduledAt }, authHeader) {
    try {
      // Convert scheduledAt to start and calculate end 
      const start = new Date(scheduledAt);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour

      const response = await axios.post(`${config.availabilityServiceUrl}/availability/validate`, {
        workerId,
        start: start.toISOString(),
        end: end.toISOString()
      }, {
        headers: { authorization: authHeader }
      });

      return response.data;
    } catch (error) {
    
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || error.response.data?.error || error.response.statusText;
        throw new Error('Validation failed: ' + message);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Validation failed: No response from availability service');
      } else {
        // Something else happened
        throw new Error('Validation failed: ' + error.message);
      }
    }
  }

  static async getBooking(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        events: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  static async updateBookingStatus(bookingId, { status, cancellationReason }, user) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check ownership
    if (booking.clientId !== user.sub && booking.workerId !== user.sub) {
      throw new Error('Unauthorized to update this booking');
    }

    // Validate transition
    if (!isValidTransition(booking.status, status)) {
      throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
    }

    // Check user permissions
    if (!canUserUpdateStatus(user.role, booking.status, status)) {
      throw new Error('User not authorized for this status change');
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        cancellationReason: status.startsWith('cancelled') ? cancellationReason : null
      }
    });

    // Create event
    const eventType = `Booking${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`;
    await prisma.bookingEvent.create({
      data: {
        eventType,
        bookingId
      }
    });

    // Invalidate cache
    await cache.clearPattern(`bookings:*`);

    updatedBooking.oldStatus = booking.status;

    return updatedBooking;
  }

  static async getBookingEvents() {

    const events = await prisma.bookingEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit for audit
    });

    return events;
  }
}

module.exports = BookingService;
