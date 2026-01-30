const Joi = require('joi');

const validateBookingSchema = Joi.object({
  workerId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required()
});

module.exports = validateBookingSchema;
