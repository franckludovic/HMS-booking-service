const Queue = require('bull');
const config = require('../config/config');

// Create a Bull queue for booking events using shared event-bus Redis
const eventQueue = new Queue('booking-events', config.eventBusRedisUrl, {
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs
  },
});

module.exports = eventQueue;
