const eventQueue = require('../queues/eventQueue');

class EventPublisher {
  static async publishEvent(eventType, data) {
    try {
      await eventQueue.add(eventType, {
        eventType,
        timestamp: new Date().toISOString(),
        data,
      });
      console.log(`Event ${eventType} queued successfully`);
    } catch (error) {
      console.error(`Failed to queue event ${eventType}:`, error.message);
      
      throw error;
    }
  }
}

module.exports = EventPublisher;
