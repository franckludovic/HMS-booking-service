const Joi = require('joi');

const createBookingSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  workerId: Joi.string().uuid().required(),
  slotId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required(),
  notes: Joi.string().optional(),
  serviceType: Joi.string().required(),
  location: Joi.string().optional(),
});

module.exports = createBookingSchema;
