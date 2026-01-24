const Joi = require('joi');

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending_approval',
    'accepted',
    'in_progress',
    'completed',
    'cancelled_by_client',
    'cancelled_by_worker'
  ).required(),
  cancellationReason: Joi.string().optional(),
});

module.exports = updateBookingStatusSchema;
