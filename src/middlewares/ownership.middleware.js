const checkOwnership = (req, res, next) => {
  // For bookings, ownership is checked in the service layer
  // This middleware can be used if needed for additional checks
  next();
};

module.exports = {
  checkOwnership,
};
