function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    console.log('Validating request body:', req[property]);
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const messages = error.details.map(d => d.message);
      console.log('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    next();
  };
}

module.exports = validateRequest;
