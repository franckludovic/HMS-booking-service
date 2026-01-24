const Joi = require('joi');

const createBookingSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  workerId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required(),
  durationMinutes: Joi.number().integer().min(1).required(),
  notes: Joi.string().optional(),
  serviceType: Joi.string().optional(),
  location: Joi.string().optional(),
});

module.exports = createBookingSchema;
